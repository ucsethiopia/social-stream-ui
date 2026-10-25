// In-memory implementation of the Social Stream API for NEXT_PUBLIC_API_MOCK.
// Mirrors the real status codes (201, 204, 207, 400, 403, 404, 409) so every
// UI state is reachable without a backend. Each request runs against the active
// mock org's database (lib/api/mock/db.ts lists the ?mockScenario and ?mockRole options).

import { ApiError, type HttpMethod, type RequestOptions, type Transport } from "@/lib/api/client";
import { mockDb, scenario, type MockDb } from "@/lib/api/mock/db";
import { localUpload } from "@/lib/api/mock/local-upload";
import { activeMockOrg } from "@/lib/api/mock/org-store";
import type {
  AuditEntry,
  ChannelCredential,
  ChannelId,
  ChannelUpsert,
  CompanyUpdate,
  NewsCreate,
  NewsItem,
  NewsUpdate,
  Paginated,
  PublishRequest,
  PublishResponse,
  TeamInvite,
  TeamMemberUpdate,
} from "@/lib/api/types";

const LATENCY_MIN_MS = 220;
const LATENCY_JITTER_MS = 380;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const now = () => new Date().toISOString().slice(0, 19);

function paginate<T>(items: T[], page = 1, pageSize = 20): Paginated<T> {
  const start = (page - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), total: items.length, page, page_size: pageSize };
}

function notFound(): never {
  throw new ApiError(404, "not_found", "Post not found");
}

function log(db: MockDb, entry: Omit<AuditEntry, "id" | "company_id" | "created_at">) {
  db.audit.unshift({ ...entry, id: db.nextAuditId++, company_id: db.company.id, created_at: now() });
}

/** The backend's PATCH handlers skip null values instead of clearing the field. */
function withoutNulls<T extends object>(patch: T): Partial<T> {
  return Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== null)) as Partial<T>;
}

function findNews(db: MockDb, id: number): NewsItem {
  return db.news.find((n) => n.id === id) ?? notFound();
}

function publish(db: MockDb, id: number, body: PublishRequest): PublishResponse {
  const post = findNews(db, id);
  if (post.status === "published") throw new ApiError(409, "conflict", "Already published");
  const missing = body.channels.filter((c) => !db.channels.some((x) => x.channel === c && x.is_active));
  if (missing.length) {
    throw new ApiError(400, "bad_request", `Channel(s) not configured or inactive: ${missing.join(", ")}`);
  }
  db.publishCount += 1;
  const publishedAt = `${now()}Z`;
  Object.assign(post, { status: "published", published_at: publishedAt, updated_at: now() });
  log(db, { actor_id: db.me.id, news_id: id, action: "post.published", channel: null, status: null, error_detail: null, metadata: null });

  const channels: PublishResponse["channels"] = {};
  for (const channel of body.channels) {
    const telegramFails = channel === "telegram" && (scenario === "partial" || db.publishCount % 2 === 0);
    const images = [post.main_image, ...(post.extra_images ?? [])].filter(Boolean);
    const needsImage = (channel === "instagram" || channel === "facebook") && images.length === 0;
    const notJpeg = channel === "instagram" && images.some((u) => /\.(png|webp)$/i.test(u ?? ""));
    const error = telegramFails
      ? "Bad Request: chat not found"
      : needsImage
        ? `${channel} requires at least one image`
        : notJpeg
          ? "Only JPEG images are supported"
          : null;
    channels[channel] = error
      ? { status: "failed", platform_post_id: null, error }
      : { status: "success", platform_post_id: String(1000 + db.nextId) };
    const status = error ? "failed" : "success";
    log(db, { actor_id: db.me.id, news_id: id, action: `publish.${channel}.${status}`, channel, status, error_detail: error, metadata: null });
  }
  return { post_id: id, published_at: publishedAt, channels };
}


type Handler = (match: RegExpMatchArray, options: RequestOptions, db: MockDb) => unknown | Promise<unknown>;

const routes: Array<[HttpMethod, RegExp, Handler]> = [
  ["GET", /^\/api\/v1\/me$/, (_m, _o, db) => db.me],
  ["GET", /^\/api\/v1\/company$/, (_m, _o, db) => db.company],
  ["PATCH", /^\/api\/v1\/company$/, (_m, o, db) => Object.assign(db.company, withoutNulls(o.json as CompanyUpdate), { updated_at: now() })],
  ["GET", /^\/api\/v1\/team$/, (_m, _o, db) => db.team],
  ["POST", /^\/api\/v1\/team\/invite$/, (_m, o, db) => {
    const invite = o.json as TeamInvite;
    if (db.team.some((m) => m.email === invite.email)) throw new ApiError(409, "conflict", "That person is already on the team");
    const member = { id: db.nextId++, clerk_user_id: `user_${db.nextId}`, company_id: db.company.id, full_name: null, email: invite.email, role: invite.role, is_active: true, created_at: now() };
    db.team.push(member);
    return member;
  }],
  ["PATCH", /^\/api\/v1\/team\/(\d+)$/, (m, o, db) => {
    const member = db.team.find((x) => x.id === Number(m[1])) ?? notFound();
    return Object.assign(member, o.json as TeamMemberUpdate);
  }],
  ["DELETE", /^\/api\/v1\/team\/(\d+)$/, (m, _o, db) => {
    if (Number(m[1]) === db.me.id) throw new ApiError(409, "conflict", "You can't deactivate yourself");
    const member = db.team.find((x) => x.id === Number(m[1])) ?? notFound();
    member.is_active = false;
  }],
  ["GET", /^\/api\/v1\/channels$/, (_m, _o, db) => db.channels],
  ["POST", /^\/api\/v1\/channels$/, (_m, o, db) => {
    const body = o.json as ChannelUpsert;
    const existing = db.channels.find((c) => c.channel === body.channel);
    if (existing) return Object.assign(existing, { credentials: body.credentials, is_active: true });
    const row: ChannelCredential = { id: db.nextId++, company_id: db.company.id, channel: body.channel, credentials: body.credentials, is_active: true, created_at: now() };
    db.channels.push(row);
    return row;
  }],
  ["DELETE", /^\/api\/v1\/channels\/(\w+)$/, (m, _o, db) => {
    if (!db.channels.some((c) => c.channel === m[1])) throw new ApiError(404, "not_found", "Channel not found");
    db.channels = db.channels.filter((c) => c.channel !== (m[1] as ChannelId));
  }],
  ["POST", /^\/api\/v1\/images\/upload$/, (_m, o) => localUpload(o)],
  ["GET", /^\/api\/v1\/news$/, (_m, o, db) => {
    const q = o.query ?? {};
    const items = db.news
      .filter((n) => !q.status || n.status === q.status)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
    return paginate(items, Number(q.page ?? 1), Number(q.page_size ?? 20));
  }],
  ["GET", /^\/api\/v1\/news\/(\d+)$/, (m, _o, db) => findNews(db, Number(m[1]))],
  ["POST", /^\/api\/v1\/news$/, (_m, o, db) => {
    const body = o.json as NewsCreate;
    const item: NewsItem = { ...body, id: db.nextId++, company_id: db.company.id, status: "draft", created_by: db.me.id, created_at: now(), updated_at: now(), published_at: null };
    db.news.unshift(item);
    return item;
  }],
  ["PATCH", /^\/api\/v1\/news\/(\d+)$/, (m, o, db) => {
    const post = findNews(db, Number(m[1]));
    if (db.me.role === "editor" && post.created_by !== db.me.id) throw new ApiError(403, "forbidden", "Forbidden");
    return Object.assign(post, withoutNulls(o.json as NewsUpdate), { updated_at: now() });
  }],
  ["DELETE", /^\/api\/v1\/news\/(\d+)$/, (m, _o, db) => {
    findNews(db, Number(m[1]));
    db.news = db.news.filter((n) => n.id !== Number(m[1]));
  }],
  ["POST", /^\/api\/v1\/news\/(\d+)\/publish$/, (m, o, db) => publish(db, Number(m[1]), o.json as PublishRequest)],
  ["GET", /^\/api\/v1\/audit$/, (_m, o, db) => {
    const q = o.query ?? {};
    const items = db.audit.filter(
      (a) => (!q.news_id || a.news_id === Number(q.news_id)) && (!q.channel || a.channel === q.channel) && (!q.action || a.action === q.action),
    );
    return paginate(items, Number(q.page ?? 1), Number(q.page_size ?? 20));
  }],
];

/** Mirrors require_role("admin") in the backend routes. */
const ADMIN_ONLY: Array<[HttpMethod, RegExp]> = [
  ["GET", /^\/api\/v1\/(team|channels|audit)/],
  ["POST", /^\/api\/v1\/(team|channels)/],
  ["PATCH", /^\/api\/v1\/(team|company)/],
  ["DELETE", /^\/api\/v1\/(team|channels|news)/],
];

export function createMockTransport(): Transport {
  return {
    async request<T>(method: HttpMethod, path: string, options: RequestOptions = {}): Promise<T> {
      const isUpload = path.endsWith("/images/upload");
      if (!isUpload) await sleep(LATENCY_MIN_MS + Math.random() * LATENCY_JITTER_MS);
      if (scenario === "offline") throw ApiError.fromBody(0, "");
      const db = mockDb(activeMockOrg().orgId);
      if (db.me.role === "editor" && ADMIN_ONLY.some(([m, re]) => m === method && re.test(path))) {
        throw new ApiError(403, "forbidden", "Forbidden");
      }
      for (const [m, pattern, handler] of routes) {
        const match = path.match(pattern);
        if (m === method && match) {
          // structuredClone keeps cached query data from aliasing the in-memory db
          const result = await handler(match, options, db);
          return (result === undefined ? undefined : structuredClone(result)) as T;
        }
      }
      throw new ApiError(404, "not_found", `Mock route not found: ${method} ${path}`);
    },
  };
}
