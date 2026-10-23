// Local safe mode (NEXT_PUBLIC_LOCAL_SAFE_MODE): talk to a *local* Social Stream
// API for real, but refuse anything that would reach outside systems:
//   - image uploads → stay in the browser (the backend would write to the real B2 bucket)
//   - connecting channel credentials → blocked (real tokens would post publicly)
//   - publishing to social channels → blocked (website-only publish is allowed; it only
//     changes the local database)
//   - team invite / role change / deactivate → blocked (the backend edits real Clerk
//     org memberships through Clerk's API)
// Any non-local API host is refused outright.

import { ApiError, type HttpMethod, type RequestOptions, type Transport } from "@/lib/api/client";
import { localUpload } from "@/lib/api/mock/local-upload";
import type { PublishRequest } from "@/lib/api/types";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);
const FORBIDDEN = 403;

interface BlockRule {
  method: HttpMethod;
  path: RegExp;
  reason: string;
}

const BLOCKED: BlockRule[] = [
  { method: "POST", path: /^\/api\/v1\/channels$/, reason: "Connecting channels is disabled in local test mode, so real accounts can't be posted to." },
  { method: "POST", path: /^\/api\/v1\/team\/invite$/, reason: "Team changes are disabled in local test mode; they edit real Clerk memberships." },
  { method: "PATCH", path: /^\/api\/v1\/team\/\d+$/, reason: "Team changes are disabled in local test mode; they edit real Clerk memberships." },
  { method: "DELETE", path: /^\/api\/v1\/team\/\d+$/, reason: "Team changes are disabled in local test mode; they edit real Clerk memberships." },
];

export function isLocalApi(apiUrl: string): boolean {
  try {
    return LOCAL_HOSTS.has(new URL(apiUrl).hostname);
  } catch {
    return false;
  }
}

function blocked(message: string): ApiError {
  return new ApiError(FORBIDDEN, "local_safe_mode", message);
}

export function createLocalSafeTransport(inner: Transport, apiUrl: string): Transport {
  const local = isLocalApi(apiUrl);
  return {
    async request<T>(method: HttpMethod, path: string, options: RequestOptions = {}): Promise<T> {
      if (!local) {
        throw blocked(`Local test mode only talks to a local API, but NEXT_PUBLIC_SOCIAL_STREAM_API_URL is ${apiUrl}.`);
      }
      if (method === "POST" && path === "/api/v1/images/upload") {
        return (await localUpload(options)) as T;
      }
      const rule = BLOCKED.find((r) => r.method === method && r.path.test(path));
      if (rule) throw blocked(rule.reason);
      if (method === "POST" && /^\/api\/v1\/news\/\d+\/publish$/.test(path)) {
        const channels = (options.json as PublishRequest | undefined)?.channels ?? [];
        if (channels.length) throw blocked("Publishing to social channels is disabled in local test mode. Turn the channels off to publish to the local database only.");
      }
      return inner.request<T>(method, path, options);
    },
  };
}
