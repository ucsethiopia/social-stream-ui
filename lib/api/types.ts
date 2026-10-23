// TypeScript mirrors of the Social Stream API schemas (../social-stream/app/schemas/*.py).
// Keep field names identical to the backend — they are sent over the wire as-is.

export type Role = "admin" | "editor";

export type ChannelId = "instagram" | "facebook" | "linkedin" | "telegram";

export type NewsStatus = "draft" | "published";

export interface Me {
  id: number;
  clerk_user_id: string;
  company_id: number;
  full_name: string | null;
  email: string | null;
  role: Role;
  is_active: boolean;
}

export interface Company {
  id: number;
  clerk_org_id: string;
  name: string;
  slug: string;
  website_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompanyUpdate {
  name?: string;
  website_url?: string | null;
}

export interface TeamMember {
  id: number;
  clerk_user_id: string;
  company_id: number;
  full_name: string | null;
  email: string | null;
  role: Role;
  is_active: boolean;
  created_at: string;
}

export interface TeamInvite {
  email: string;
  role: Role;
}

export interface TeamMemberUpdate {
  role?: Role;
  is_active?: boolean;
}

export type ChannelCredentials = Record<string, string>;

export interface ChannelCredential {
  id: number;
  company_id: number;
  channel: ChannelId;
  credentials: ChannelCredentials;
  is_active: boolean;
  created_at: string;
}

export interface ChannelUpsert {
  channel: ChannelId;
  credentials: ChannelCredentials;
}

export interface NewsFields {
  title: string;
  subtitle: string | null;
  /** ISO date (YYYY-MM-DD) */
  date: string;
  tags: string[];
  team: string | null;
  body: string;
  main_image: string | null;
  extra_images: string[];
  /** Only sent when config.hashtagsField is on (pending backend support). */
  hashtags?: string[];
}

export type NewsCreate = NewsFields;
export type NewsUpdate = Partial<NewsFields>;

export interface NewsItem extends NewsFields {
  id: number;
  company_id: number;
  status: NewsStatus;
  created_by: number | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

export interface NewsListParams {
  page?: number;
  page_size?: number;
  status?: NewsStatus;
}

export interface PublishRequest {
  channels: ChannelId[];
}

export interface PublishChannelResult {
  status: "success" | "failed";
  platform_post_id: string | null;
  error?: string | null;
}

export interface PublishResponse {
  post_id: number;
  published_at: string;
  channels: Partial<Record<ChannelId, PublishChannelResult>>;
}

export interface AuditEntry {
  id: number;
  company_id: number;
  actor_id: number | null;
  news_id: number | null;
  action: string;
  channel: ChannelId | null;
  status: string | null;
  error_detail: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface AuditListParams {
  page?: number;
  page_size?: number;
  news_id?: number;
  channel?: ChannelId;
  action?: string;
}

export interface ImageUploadResponse {
  url: string;
}

export interface HealthResponse {
  status: "healthy" | "unhealthy";
  database: string;
}
