import { describe, expect, it, vi } from "vitest";
import type { HttpMethod, RequestOptions, Transport } from "@/lib/api/client";
import { createLocalSafeTransport, isLocalApi } from "@/lib/api/safe-transport";

function spyTransport() {
  const request = vi.fn(async () => "passed-through");
  return { transport: { request } as unknown as Transport, request };
}

describe("isLocalApi", () => {
  it.each([
    ["http://localhost:8002", true],
    ["http://127.0.0.1:8002", true],
    ["https://api.ucsethiopia.com", false],
    ["not a url", false],
  ])("%s → %s", (url, local) => expect(isLocalApi(url)).toBe(local));
});

describe("local safe transport", () => {
  it.each<[HttpMethod, string, RequestOptions | undefined]>([
    ["POST", "/api/v1/channels", { json: { channel: "telegram", credentials: {} } }],
    ["POST", "/api/v1/team/invite", { json: { email: "a@b.c", role: "editor" } }],
    ["PATCH", "/api/v1/team/4", { json: { role: "admin" } }],
    ["DELETE", "/api/v1/team/4", undefined],
    ["POST", "/api/v1/news/7/publish", { json: { channels: ["telegram"] } }],
  ])("blocks %s %s without calling the API", async (method, path, options) => {
    const { transport, request } = spyTransport();
    await expect(createLocalSafeTransport(transport, "http://localhost:8002").request(method, path, options)).rejects.toMatchObject({
      status: 403,
      code: "local_safe_mode",
    });
    expect(request).not.toHaveBeenCalled();
  });

  it.each<[HttpMethod, string, RequestOptions | undefined]>([
    ["GET", "/api/v1/me", undefined],
    ["POST", "/api/v1/news", { json: { title: "t" } }],
    ["POST", "/api/v1/news/7/publish", { json: { channels: [] } }],
    ["DELETE", "/api/v1/channels/telegram", undefined],
  ])("passes %s %s through", async (method, path, options) => {
    const { transport, request } = spyTransport();
    await expect(createLocalSafeTransport(transport, "http://localhost:8002").request(method, path, options)).resolves.toBe("passed-through");
    expect(request).toHaveBeenCalledOnce();
  });

  it("refuses every request when the API isn't local", async () => {
    const { transport, request } = spyTransport();
    await expect(createLocalSafeTransport(transport, "https://api.ucsethiopia.com").request("GET", "/api/v1/me")).rejects.toMatchObject({ code: "local_safe_mode" });
    expect(request).not.toHaveBeenCalled();
  });
});
