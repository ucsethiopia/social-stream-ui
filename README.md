# social-stream-ui

A content distribution app. You write a post once, see exactly how it will look on each platform, then publish it to your organisation's website and whichever social channels you choose (LinkedIn, Telegram, Facebook, Instagram). One person can work across several organisations.

It's a frontend for the [Social Stream API](https://github.com/ucsethiopia/social-stream). Clerk handles sign-in and organisations.

> **Current scope:** UCS Ethiopia is the first organisation. Until launch, Clerk only accepts `@ucsethiopia.com` sign-ins, and UCS's website (Settings → Website) is the dev site **https://dev.ucsethiopia.com**. Use mock mode; don't run it against the live API, because publishing puts posts on the real website. At launch, sign-up opens so anyone can create and manage their own organisation, team and channels.

## Quick start (no backend needed)

```bash
npm install
cp .env.example .env.local   
npm run dev                  
```

Mock mode skips Clerk and signs you in to three sample organisations; switch between them from the top bar. Add one of these to any URL to see other states:

| Query | Effect |
|---|---|
| `?mockOrg=entoto` | Opens a sample org where you're an editor (`ucs` and `lalibela` are admin; Lalibela is new and empty) |
| `?mockScenario=empty` | No posts, channels or activity |
| `?mockScenario=partial` | Every Telegram send fails, so publishing returns a 207 |
| `?mockScenario=offline` | Every request fails |
| `?mockRole=editor` | Signs you in as an editor in every org; `?mockRole=default` goes back to your own roles |

`npm run build` refuses mock mode so a no-sign-in build can't ship by accident. For a deliberate demo deploy, set `ALLOW_MOCK_BUILD=true`.

## Against a local backend (optional; never the live API)

The local stack has its own Postgres, so nothing reaches the website. **Always pass the local override file.** Plain `docker compose up` (or `./docker-up.sh` without `--local`) uses the database from the backend's `.env` and runs migrations on it at startup.

1. Free port 5432 if another Postgres container is using it (`docker ps`).
2. In `../social-stream`, start Postgres first and wait for it. The API doesn't wait on its own (`depends_on` has no healthcheck):
   ```bash
   docker compose -f docker-compose.yml -f docker-compose.local.yml up -d postgres
   docker compose -f docker-compose.yml -f docker-compose.local.yml --profile init up --build initdb   # migrate + seed
   docker compose -f docker-compose.yml -f docker-compose.local.yml up api
   ```
   It serves on `:8002`, and its `ALLOWED_ORIGINS` must include `http://localhost:3000`.
2. In `.env.local`, set `NEXT_PUBLIC_API_MOCK=false` and keep `NEXT_PUBLIC_LOCAL_SAFE_MODE=true`. Safe mode keeps image uploads out of the real bucket, blocks channel, team and social-publishing calls, and refuses any API that isn't localhost. Restart `npm run dev` on port 3000 (the only localhost port the API's CORS allows).
3. Run `npm run dev`, sign in, and pick or create your organisation.

## Scripts

`npm run dev` · `npm run build` · `npm run lint` · `npm run typecheck` · `npm test`
