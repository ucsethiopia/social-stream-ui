// In-memory data behind the mock transport: one database per mock organisation,
// created on first use, so each org's posts, team and channels stay separate.
//
// Scenarios (append ?mockScenario=<name> to any URL; persists per tab):
//   default — seeded data, Telegram dispatch fails on every second publish
//   empty   — no posts, no channels, no activity in any org
//   partial — every Telegram dispatch fails (207)
//   offline — every request fails as if the API were unreachable
//
// ?mockRole=editor|admin signs you in as a teammate with that role in every
// org (in UCS, ?mockRole=editor is Dawit) instead of your own membership;
// ?mockRole=default goes back to your own role in each org.

import { buildMockAudit, MOCK_AUDIT_ID_START } from "@/lib/api/mock/fixtures";
import { findMockOrg, type MockOrg } from "@/lib/api/mock/orgs";
import type { AuditEntry, ChannelCredential, Company, Me, NewsItem, Role, TeamMember } from "@/lib/api/types";

export type Scenario = "default" | "empty" | "partial" | "offline";
const SCENARIO_KEY = "ss-mock-scenario";
const ROLE_KEY = "ss-mock-role";
const AUDIT_ID_OFFSET = 1000;

function readScenario(): Scenario {
  if (typeof window === "undefined") return "default";
  const fromUrl = new URLSearchParams(window.location.search).get("mockScenario");
  const valid: Scenario[] = ["default", "empty", "partial", "offline"];
  try {
    if (fromUrl && valid.includes(fromUrl as Scenario)) sessionStorage.setItem(SCENARIO_KEY, fromUrl);
    const stored = sessionStorage.getItem(SCENARIO_KEY);
    return valid.includes(stored as Scenario) ? (stored as Scenario) : "default";
  } catch {
    return "default";
  }
}

function readRoleOverride(): Role | null {
  if (typeof window === "undefined") return null;
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("mockRole");
    if (fromUrl === "admin" || fromUrl === "editor") sessionStorage.setItem(ROLE_KEY, fromUrl);
    if (fromUrl === "default") sessionStorage.removeItem(ROLE_KEY);
    const stored = sessionStorage.getItem(ROLE_KEY);
    return stored === "admin" || stored === "editor" ? stored : null;
  } catch {
    return null;
  }
}

export const scenario = readScenario();
const roleOverride = readRoleOverride();

/** Who is signed in to this org: your own membership, or a teammate with the ?mockRole role. */
export function mockUserFor(org: MockOrg): Me {
  if (!roleOverride || roleOverride === org.me.role) return org.me;
  const teammate = org.team.find((m) => m.id !== org.me.id && m.is_active && m.role === roleOverride);
  if (!teammate) return { ...org.me, role: roleOverride };
  const { id, clerk_user_id, company_id, full_name, email, role, is_active } = teammate;
  return { id, clerk_user_id, company_id, full_name, email, role, is_active };
}

export interface MockDb {
  me: Me;
  company: Company;
  team: TeamMember[];
  channels: ChannelCredential[];
  news: NewsItem[];
  audit: AuditEntry[];
  publishCount: number;
  nextId: number;
  nextAuditId: number;
}

const dbs = new Map<string, MockDb>();

function createDb(org: MockOrg): MockDb {
  const empty = scenario === "empty";
  const news = empty ? [] : org.buildNews();
  return {
    me: mockUserFor(org),
    company: { ...org.company },
    team: org.team.map((m) => ({ ...m })),
    channels: empty ? [] : org.channels.map((c) => ({ ...c })),
    news,
    audit: empty ? [] : buildMockAudit(news, org.auditChannels),
    publishCount: 0,
    nextId: org.nextId,
    nextAuditId: MOCK_AUDIT_ID_START + AUDIT_ID_OFFSET,
  };
}

export function mockDb(orgId: string): MockDb {
  const org = findMockOrg(orgId);
  if (!org) throw new Error(`Unknown mock org: ${orgId}`);
  let db = dbs.get(org.orgId);
  if (!db) {
    db = createDb(org);
    dbs.set(org.orgId, db);
  }
  return db;
}
