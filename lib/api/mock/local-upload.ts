// A stand-in for POST /images/upload that never leaves the browser: same
// validation and progress events as the real endpoint, but the "public URL"
// is a local blob: URL. Used by mock mode and by local safe mode, so test
// runs never write to the real Backblaze bucket.

import { ApiError, type RequestOptions } from "@/lib/api/client";
import type { ImageUploadResponse } from "@/lib/api/types";

const UPLOAD_STEPS = 8;
const UPLOAD_STEP_MS = 140;
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function localUpload(options: RequestOptions): Promise<ImageUploadResponse> {
  const file = options.formData?.get("file");
  if (!(file instanceof File)) throw new ApiError(400, "bad_request", "No file");
  if (!ALLOWED_TYPES.includes(file.type)) throw new ApiError(400, "invalid_type", "Only JPEG, PNG or WEBP images are allowed");
  if (file.size > MAX_UPLOAD_BYTES) throw new ApiError(400, "too_large", "Image must be 10 MB or smaller");
  for (let step = 1; step <= UPLOAD_STEPS; step++) {
    if (options.signal?.aborted) throw new DOMException("Aborted", "AbortError");
    await sleep(UPLOAD_STEP_MS);
    options.onUploadProgress?.(step / UPLOAD_STEPS);
  }
  return { url: URL.createObjectURL(file) };
}
