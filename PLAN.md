# PLAN — Social Stream UI

The full rationale is in CLAUDE.md. This file tracks progress. `>>` marks the next task.

## Done

- [x] **1. Scaffold.** Next 16, Tailwind 4, shadcn new-york, UCS tokens and fonts, Vitest, `.env.example`.
- [x] **2. Auth and shell.** Clerk + `proxy.ts`, sign-in/up, onboarding, `MeGate`, sidebar and top bar, role gating, ⌘K palette, `N` shortcut.
- [x] **3. API layer and posts library.** Typed client, endpoints, org-scoped query keys, mock transport, `/posts`.
- [x] **4. Composer.** Dialog driven by `?compose=`, media upload and reorder, fields, main tag, hashtags, autosave.
- [x] **5. Previews.** Ports of the Python caption builders with parity tests, plus Website, LinkedIn, Telegram, Facebook and Instagram previews.
- [x] **6. Publish flow.** Review, progress and results, with 200, 207, 400 and 409 handled.
- [x] **7. Admin pages.** Channels (masked credentials), Team, Activity, Settings.
- [x] **8. Dashboard and polish.** Quick start, stats, drafts, channel health, deliveries.
- [x] **9. Design loop, rounds 1–3.** See `docs/design-review.md`.
- [x] **10. CLAUDE.md**

## Next

> **Scope:** UCS is the first org; the UI is org-neutral. Sign-up stays limited to @ucsethiopia.com in Clerk until launch. Mock mode only; no live API requests (see CLAUDE.md → Current scope).

- [ ] >> **11. End-to-end against the *local* docker backend** (local Postgres only, never the live API). Walk through: sign in, onboarding, `/me`, a draft with 3 images, publish to website only, then publish to Telegram with a bad token and expect a 207. Blocked until the local stack starts; see the docker steps in README.
- [ ] **12. Raise the backend requests** listed in CLAUDE.md with the social-stream team. Flip `NEXT_PUBLIC_API_HASHTAGS_FIELD` once #1 ships.
- [ ] **13. Editor channel status.** Once `GET /channels/status` exists, wire it into `useConnectedChannels` and remove the editor note.
- [ ] **14. Retry failed channels.** Once the backend supports it, add a "Retry" action on failed rows (publish results and `PublishedSummary`).
- [ ] **15. Deferred features** (each needs an API first): scheduling with a calendar view, a media library tray, and per-platform caption overrides.
- [ ] **16. E2E smoke tests.** Playwright against mock mode, covering compose, publish (207) and editor read-only.
- [ ] **17. Switch to production.** Change UCS's Settings → Website to https://ucsethiopia.com and point the API at production once dev sign-off is done.
- [x] **18a. Org-neutral UI.** No UCS-specific name, logo, copy or URL outside the mock data. Each org's `company.website_url` drives links and previews. Org switching, creation and management use Clerk's switcher. Mock mode has three sample orgs (`?mockOrg=`). Destinations are remembered per org, and `MeGate` explains the 409 for a duplicate org name. Also: dark theme by default, and the Social Stream mark and favicon.
- [ ] **18b. Open sign-up (launch).** Turn off the Clerk email allowlist and allow anyone to create organisations. Add onboarding for a brand-new org (connect the first channel, invite the team), and decide whether team management stays in our Team page or Clerk's Manage organisation. Needs backend request #8 (company name sync).
