// The organisations the mock user belongs to, so switching orgs can be tested
// without Clerk or a backend. Like the real API, the same person has a separate
// membership (and role) in each org. UCS is seeded in fixtures.ts; the other two
// are fictional.

import { buildMockNews, mockChannels, mockCompany, mockMe, mockTeam, type Seed } from "@/lib/api/mock/fixtures";
import type { ChannelCredential, ChannelId, Company, Me, NewsItem, TeamMember } from "@/lib/api/types";

export type MockOrgKey = "ucs" | "entoto" | "lalibela";

export interface MockOrg {
  key: MockOrgKey;
  /** Clerk organisation id; the backend's company.clerk_org_id. */
  orgId: string;
  imageUrl: string | null;
  company: Company;
  /** The signed-in person's membership in this org. */
  me: Me;
  team: TeamMember[];
  channels: ChannelCredential[];
  /** Channels that show up in the seeded activity log. */
  auditChannels: ChannelId[];
  buildNews: () => NewsItem[];
  /** First id handed out to rows created in this org. */
  nextId: number;
}

const CREATED = "2026-08-14T09:00:00";
const USER = { clerk_user_id: mockMe.clerk_user_id, full_name: mockMe.full_name, email: mockMe.email };

const ENTOTO_ID = 2;
const ENTOTO_NEWS_ID_START = 300;
const entotoMe: Me = { ...USER, id: 212, company_id: ENTOTO_ID, role: "editor", is_active: true };
const entotoSeeds: Seed[] = [
  {
    title: "Water Access in Ethiopia's Secondary Cities",
    subtitle: "Findings from a twelve-month survey in Adama, Hawassa and Bahir Dar",
    tags: ["Research"],
    team: "Urban Policy",
    body: "Household connections have grown faster than supply. Our survey of 1,800 households maps where the gaps are widest and which utilities are closing them.",
    images: ["services-hero-background-enhanced.jpg"],
    daysAgo: 4,
    published: true,
    createdBy: 210,
  },
  {
    title: "Panel: Financing the Green Transition",
    subtitle: "Join us on 14 November at the Entoto Forum hall",
    tags: ["Events"],
    team: "Programmes",
    body: "Three practitioners from development finance, a commercial bank and a solar start-up discuss what it takes to fund renewable projects at scale.",
    images: ["hero-background-v0.jpg"],
    daysAgo: 1,
    published: false,
    createdBy: 212,
  },
  {
    title: "Land Tenure Brief (internal draft)",
    subtitle: "",
    tags: ["Research"],
    team: "Rural Policy",
    body: "Draft for review. Not ready to publish.",
    images: [],
    daysAgo: 0,
    published: false,
    createdBy: 214,
  },
];

const LALIBELA_ID = 3;
const lalibelaMe: Me = { ...USER, id: 312, company_id: LALIBELA_ID, role: "admin", is_active: true };

export const MOCK_ORGS: MockOrg[] = [
  {
    key: "ucs",
    orgId: mockCompany.clerk_org_id,
    imageUrl: "/brand/ucs-mark.png",
    company: mockCompany,
    me: mockMe,
    team: mockTeam,
    channels: mockChannels,
    auditChannels: ["linkedin", "telegram"],
    buildNews: () => buildMockNews(),
    nextId: 100,
  },
  {
    key: "entoto",
    orgId: "org_mock_entoto",
    imageUrl: null,
    company: { id: ENTOTO_ID, clerk_org_id: "org_mock_entoto", name: "Entoto Policy Forum", slug: "entoto-policy-forum", website_url: "https://entoto-forum.example", created_at: "2026-05-20T08:00:00", updated_at: "2026-08-01T12:00:00" },
    me: entotoMe,
    team: [
      { id: 210, clerk_user_id: "user_mock_entoto_1", company_id: ENTOTO_ID, full_name: "Meron Assefa", email: "meron@entoto-forum.example", role: "admin", is_active: true, created_at: "2026-05-20T08:00:00" },
      { ...entotoMe, created_at: "2026-06-03T10:30:00" },
      { id: 214, clerk_user_id: "user_mock_entoto_3", company_id: ENTOTO_ID, full_name: "Kebede Tola", email: "kebede@entoto-forum.example", role: "editor", is_active: true, created_at: "2026-07-08T15:10:00" },
    ],
    channels: [
      { id: 201, company_id: ENTOTO_ID, channel: "telegram", credentials: { bot_token: "7099887766:AAEmockEntotoTelegram4d2", channel_id: "@entotoforum" }, is_active: true, created_at: "2026-05-21T09:00:00" },
    ],
    auditChannels: ["telegram"],
    buildNews: () => buildMockNews(entotoSeeds, ENTOTO_ID, ENTOTO_NEWS_ID_START),
    nextId: 400,
  },
  {
    key: "lalibela",
    orgId: "org_mock_lalibela",
    imageUrl: null,
    company: { id: LALIBELA_ID, clerk_org_id: "org_mock_lalibela", name: "Lalibela Coffee Exporters", slug: "lalibela-coffee-exporters", website_url: null, created_at: CREATED, updated_at: CREATED },
    me: lalibelaMe,
    team: [{ ...lalibelaMe, created_at: CREATED }],
    channels: [],
    auditChannels: [],
    buildNews: () => [],
    nextId: 600,
  },
];

export const DEFAULT_MOCK_ORG = MOCK_ORGS[0];

export function findMockOrg(keyOrId: string | null | undefined): MockOrg | undefined {
  return MOCK_ORGS.find((o) => o.key === keyOrId || o.orgId === keyOrId);
}
