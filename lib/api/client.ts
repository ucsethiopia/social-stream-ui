// HTTP transport for the Social Stream API. Adapted from
// social-stream-auth-ui/src/api/socialStreamClient.ts, but throws a typed
// ApiError instead of returning a union so TanStack Query can own error state.

import { config } from "@/lib/config";

export type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

export type QueryValue = string | number | boolean | undefined | null;

export interface RequestOptions {
  query?: Record<string, QueryValue>;
  json?: unknown;
  formData?: FormData;
  signal?: AbortSignal;
  /** Fraction 0–1. Only honoured for formData uploads. */
  onUploadProgress?: (fraction: number) => void;
}

export interface Transport {
  request<T>(method: HttpMethod, path: string, options?: RequestOptions): Promise<T>;
}

export type TokenGetter = () => Promise<string | null>;

/** Error shape from docs/API.md ({ error, message, detail }) or FastAPI's default ({ detail }). */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly detail: unknown;

  constructor(status: number, code: string, message: string, detail?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.detail = detail;
  }

  static fromBody(status: number, bodyText: string): ApiError {
    try {
      const body = JSON.parse(bodyText) as { error?: string; message?: string; detail?: unknown };
      const detailText = typeof body.detail === "string" ? body.detail : undefined;
      return new ApiError(
        status,
        body.error ?? `http_${status}`,
        validationMessage(body.detail) ?? body.message ?? detailText ?? defaultMessage(status),
        body.detail,
      );
    } catch {
      return new ApiError(status, `http_${status}`, bodyText.slice(0, 300) || defaultMessage(status));
    }
  }
}

interface ValidationIssue {
  loc?: Array<string | number>;
  msg?: string;
}

/** 422 bodies carry detail.errors[] ({ loc, msg }); name the field instead of "Request validation failed". */
function validationMessage(detail: unknown): string | undefined {
  const errors = (detail as { errors?: ValidationIssue[] } | null)?.errors;
  if (!Array.isArray(errors) || !errors.length) return undefined;
  return errors
    .map((e) => {
      const field = e.loc?.filter((part) => part !== "body").at(-1);
      return field !== undefined ? `${String(field).replace(/_/g, " ")}: ${e.msg ?? "invalid"}` : (e.msg ?? "invalid");
    })
    .join("; ");
}

function abortError(): DOMException {
  return new DOMException("Aborted", "AbortError");
}

function defaultMessage(status: number): string {
  if (status === 0) return "Can't reach the Social Stream API. Check your connection.";
  if (status === 401) return "Your session expired. Sign in again.";
  if (status === 403) return "You don't have permission to do that.";
  if (status === 404) return "Not found.";
  if (status === 409) return "This conflicts with the current state — refresh and try again.";
  if (status >= 500) return "The server had a problem. Try again in a moment.";
  return `Request failed (${status}).`;
}

export function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const url = new URL(`${config.apiUrl}${path.startsWith("/") ? path : `/${path}`}`);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
  }
  return url.toString();
}

function parseBody<T>(status: number, text: string): T {
  if (!text.trim()) return undefined as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ApiError(status, "invalid_json", `Invalid JSON from API: ${text.slice(0, 200)}`);
  }
}

function uploadWithProgress<T>(url: string, token: string | null, options: RequestOptions): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    if (options.signal?.aborted) return reject(abortError());
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.setRequestHeader("Accept", "application/json");
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) options.onUploadProgress?.(e.loaded / e.total);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(parseBody<T>(xhr.status, xhr.responseText));
        } catch (err) {
          reject(err);
        }
      } else {
        reject(ApiError.fromBody(xhr.status, xhr.responseText));
      }
    };
    xhr.onerror = () => reject(ApiError.fromBody(0, ""));
    xhr.onabort = () => reject(abortError());
    options.signal?.addEventListener("abort", () => xhr.abort());
    xhr.send(options.formData ?? null);
  });
}

export function createHttpTransport(getToken: TokenGetter): Transport {
  return {
    async request<T>(method: HttpMethod, path: string, options: RequestOptions = {}): Promise<T> {
      const token = await getToken();
      const url = buildUrl(path, options.query);

      if (options.formData && options.onUploadProgress) {
        return uploadWithProgress<T>(url, token, options);
      }

      const headers: Record<string, string> = { Accept: "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;
      let body: BodyInit | undefined;
      if (options.formData) {
        body = options.formData;
      } else if (options.json !== undefined) {
        headers["Content-Type"] = "application/json";
        body = JSON.stringify(options.json);
      }

      let res: Response;
      try {
        res = await fetch(url, { method, headers, body, signal: options.signal });
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") throw err;
        throw ApiError.fromBody(0, "");
      }
      const text = await res.text();
      if (!res.ok) throw ApiError.fromBody(res.status, text);
      return parseBody<T>(res.status, text);
    },
  };
}
