// Typed endpoint functions — the only place API paths appear. Hooks in
// hooks/ call these; components never call fetch directly.

import type { Transport } from "@/lib/api/client";
import type {
  AuditEntry,
  AuditListParams,
  ChannelCredential,
  ChannelId,
  ChannelUpsert,
  Company,
  CompanyUpdate,
  ImageUploadResponse,
  Me,
  NewsCreate,
  NewsItem,
  NewsListParams,
  NewsUpdate,
  Paginated,
  PublishRequest,
  PublishResponse,
  TeamInvite,
  TeamMember,
  TeamMemberUpdate,
} from "@/lib/api/types";

export function createApi(t: Transport) {
  return {
    me: () => t.request<Me>("GET", "/api/v1/me"),

    company: {
      get: () => t.request<Company>("GET", "/api/v1/company"),
      update: (patch: CompanyUpdate) => t.request<Company>("PATCH", "/api/v1/company", { json: patch }),
    },

    team: {
      list: () => t.request<TeamMember[]>("GET", "/api/v1/team"),
      invite: (invite: TeamInvite) => t.request<TeamMember>("POST", "/api/v1/team/invite", { json: invite }),
      update: (id: number, patch: TeamMemberUpdate) =>
        t.request<TeamMember>("PATCH", `/api/v1/team/${id}`, { json: patch }),
      deactivate: (id: number) => t.request<void>("DELETE", `/api/v1/team/${id}`),
    },

    channels: {
      list: () => t.request<ChannelCredential[]>("GET", "/api/v1/channels"),
      upsert: (body: ChannelUpsert) => t.request<ChannelCredential>("POST", "/api/v1/channels", { json: body }),
      remove: (channel: ChannelId) => t.request<void>("DELETE", `/api/v1/channels/${channel}`),
    },

    images: {
      upload: (file: File, onProgress?: (fraction: number) => void, signal?: AbortSignal) => {
        const formData = new FormData();
        formData.append("file", file);
        return t.request<ImageUploadResponse>("POST", "/api/v1/images/upload", {
          formData,
          onUploadProgress: onProgress,
          signal,
        });
      },
    },

    news: {
      list: (params: NewsListParams = {}) =>
        t.request<Paginated<NewsItem>>("GET", "/api/v1/news", { query: { ...params } }),
      get: (id: number) => t.request<NewsItem>("GET", `/api/v1/news/${id}`),
      create: (body: NewsCreate) => t.request<NewsItem>("POST", "/api/v1/news", { json: body }),
      update: (id: number, patch: NewsUpdate) =>
        t.request<NewsItem>("PATCH", `/api/v1/news/${id}`, { json: patch }),
      remove: (id: number) => t.request<void>("DELETE", `/api/v1/news/${id}`),
      publish: (id: number, body: PublishRequest) =>
        t.request<PublishResponse>("POST", `/api/v1/news/${id}/publish`, { json: body }),
    },

    audit: {
      list: (params: AuditListParams = {}) =>
        t.request<Paginated<AuditEntry>>("GET", "/api/v1/audit", { query: { ...params } }),
    },
  };
}

export type Api = ReturnType<typeof createApi>;
