// Realistic UCS seed data for NEXT_PUBLIC_API_MOCK. Images live in public/mock.

import type { AuditEntry, ChannelCredential, Company, Me, NewsItem, TeamMember } from "@/lib/api/types";

const COMPANY_ID = 1;

export const mockCompany: Company = {
  id: COMPANY_ID,
  clerk_org_id: "org_mock_ucs",
  name: "Ultimate Consultancy Services",
  slug: "ultimate-consultancy-services",
  website_url: "https://dev.ucsethiopia.com",
  created_at: "2026-03-30T10:00:00",
  updated_at: "2026-09-02T08:15:00",
};

export const mockMe: Me = {
  id: 12,
  clerk_user_id: "user_mock_admin",
  company_id: COMPANY_ID,
  full_name: "Selam Tadesse",
  email: "selam@ucsethiopia.com",
  role: "admin",
  is_active: true,
};

export const mockTeam: TeamMember[] = [
  { ...mockMe, created_at: "2026-03-30T10:00:00" },
  { id: 14, clerk_user_id: "user_mock_2", company_id: COMPANY_ID, full_name: "Dawit Bekele", email: "dawit@ucsethiopia.com", role: "editor", is_active: true, created_at: "2026-04-12T09:20:00" },
  { id: 17, clerk_user_id: "user_mock_3", company_id: COMPANY_ID, full_name: "Hanna Girma", email: "hanna@ucsethiopia.com", role: "editor", is_active: true, created_at: "2026-06-01T14:05:00" },
  { id: 19, clerk_user_id: "user_mock_4", company_id: COMPANY_ID, full_name: "Yonas Alemu", email: "yonas@ucsethiopia.com", role: "editor", is_active: false, created_at: "2026-07-19T11:40:00" },
];

export const mockChannels: ChannelCredential[] = [
  { id: 1, company_id: COMPANY_ID, channel: "linkedin", credentials: { access_token: "AQXmockLinkedInToken9f2c", organization_id: "87654321" }, is_active: true, created_at: "2026-04-02T10:00:00" },
  { id: 2, company_id: COMPANY_ID, channel: "telegram", credentials: { bot_token: "7012345678:AAHmockTelegramTokenx81a", channel_id: "@ucsethiopia" }, is_active: true, created_at: "2026-04-02T10:05:00" },
  { id: 3, company_id: COMPANY_ID, channel: "facebook", credentials: { page_access_token: "EAAGmockFacebookPageTokenq7Lm", page_id: "102938475610" }, is_active: true, created_at: "2026-05-11T16:30:00" },
];

const img = (name: string) => `/mock/${name}`;

interface Seed {
  title: string;
  subtitle: string | null;
  tags: string[];
  team: string | null;
  body: string;
  images: string[];
  daysAgo: number;
  published: boolean;
  createdBy: number;
}

const seeds: Seed[] = [
  {
    title: "Ethiopia's FX Reform, One Year On",
    subtitle: "What the float has meant for importers, banks and inflation — and what comes next",
    tags: ["Research", "highlight"],
    team: "Research & Publication",
    body: "Twelve months after the National Bank of Ethiopia moved to a market-based exchange rate, the parallel-market premium has narrowed sharply and export receipts are recovering. Our latest brief looks at how commercial banks have adapted their FX allocation, where import costs have landed, and the three indicators we are watching into 2027.\n\n#UCSEthiopia #Economy #FXReform",
    images: ["hero-background-v2-newer.jpg", "services-hero-background-enhanced.jpg"],
    daysAgo: 2,
    published: true,
    createdBy: 12,
  },
  {
    title: "Awash Bank: 30 Years of Banking for Everyone",
    subtitle: "A commemorative publication produced with Awash Bank's communications team",
    tags: ["Publications"],
    team: "Communication & Promotion",
    body: "We were proud to research, write and design Awash Bank's 30th anniversary book — three decades of growth from a single branch in Addis Ababa to one of the country's largest private banks.\n\n#Awash30 #Publications",
    images: ["awash-30th.jpg"],
    daysAgo: 6,
    published: true,
    createdBy: 14,
  },
  {
    title: "Leadership Masterclass for Microfinance Executives",
    subtitle: "Registration is open for the November cohort in Bole",
    tags: ["Training"],
    team: "Training",
    body: "A three-day, case-based programme for senior leaders in Ethiopian microfinance institutions covering governance, digital lending risk and talent strategy. Seats are limited to 24 participants.",
    images: ["services-hero-background-0.jpg"],
    daysAgo: 1,
    published: false,
    createdBy: 17,
  },
  {
    title: "Q4 Outlook: Interest Rates and Credit Growth",
    subtitle: "",
    tags: ["Research"],
    team: "Research & Publication",
    body: "Draft — figures pending the NBE monetary policy committee statement.",
    images: [],
    daysAgo: 0,
    published: false,
    createdBy: 12,
  },
  {
    title: "Gebecon Industrial Brochure Launch",
    subtitle: "Brand and print collateral for a leading Ethiopian manufacturer",
    tags: ["Communication"],
    team: "Communication & Promotion",
    body: "New brand collateral for Gebecon, including a product brochure, trade-show signage and a refreshed visual identity.",
    images: ["gebecon-brochure.jpg", "hero-background-v0.jpg"],
    daysAgo: 13,
    published: true,
    createdBy: 14,
  },
];

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

/** UTC timestamp without a zone suffix, like the API returns. Always in the past. */
function isoDaysAgo(days: number, hoursEarlier = 0): string {
  return new Date(Date.now() - days * DAY_MS - hoursEarlier * HOUR_MS).toISOString().slice(0, 19);
}

export function buildMockNews(): NewsItem[] {
  return seeds.map((s, i) => {
    const created = isoDaysAgo(s.daysAgo, 26);
    const images = s.images.map(img);
    return {
      id: 40 + i,
      company_id: COMPANY_ID,
      title: s.title,
      subtitle: s.subtitle,
      date: created.slice(0, 10),
      tags: s.tags,
      team: s.team,
      body: s.body,
      main_image: images[0] ?? null,
      extra_images: images.slice(1),
      status: s.published ? "published" : "draft",
      created_by: s.createdBy,
      created_at: created,
      updated_at: isoDaysAgo(s.daysAgo, 3),
      published_at: s.published ? `${isoDaysAgo(s.daysAgo, 2)}Z` : null,
    };
  });
}

/** Audit ids live in their own range so they never collide with post/member ids. */
export const MOCK_AUDIT_ID_START = 5000;

// Same rows the backend writes on publish: "post.published" then "publish.{channel}.{status}".
export function buildMockAudit(news: NewsItem[]): AuditEntry[] {
  const entries: AuditEntry[] = [];
  let id = MOCK_AUDIT_ID_START;
  for (const n of news) {
    if (n.status !== "published" || !n.published_at) continue;
    const at = n.published_at.replace("Z", "");
    const base = { company_id: COMPANY_ID, actor_id: n.created_by, news_id: n.id, created_at: at };
    const telegramFailed = n.id % 2 === 1;
    entries.push({ ...base, id: id++, action: "post.published", channel: null, status: null, error_detail: null, metadata: null });
    entries.push({ ...base, id: id++, action: "publish.linkedin.success", channel: "linkedin", status: "success", error_detail: null, metadata: { platform_post_id: "urn:li:share:7100" } });
    entries.push({
      ...base,
      id: id++,
      action: `publish.telegram.${telegramFailed ? "failed" : "success"}`,
      channel: "telegram",
      status: telegramFailed ? "failed" : "success",
      error_detail: telegramFailed ? "Bad Request: chat not found" : null,
      metadata: { platform_post_id: telegramFailed ? null : "481" },
    });
  }
  return entries.sort((a, b) => b.created_at.localeCompare(a.created_at));
}
