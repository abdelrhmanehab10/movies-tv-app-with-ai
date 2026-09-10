# Todo

- [x] Limit free AI recommendations to 3 picks per authenticated user. Add a Supabase quota table, an atomic server-side claim function, `AUTH_REQUIRED` and `FREE_LIMIT_REACHED` responses, remaining-picks feedback in the UI, and tests for concurrent requests and provider failures. See [the research note](research/free-pick-limit-for-cinemotion.md).
- [x] Persist the latest recommendation result in browser `localStorage` so it survives page refreshes, with safe parsing, a versioned storage key, and clear/reset behavior when the user requests another pick.
- [x] Add a hint near the recommendation that signing in lets users save their recommended list.

## Review findings — 2026-09-09

### High priority

- [x] Protect the TMDB credential. Move browse, search, and detail requests behind server API routes and use a server-only `TMDB_API_KEY`; do not expose the credential through a public environment variable.

### Medium priority

- [x] Fix search pagination URL construction. The search URL already contains query parameters, but pagination appends a second `?`, producing URLs such as `language=en-US?page=2`. Use `URL`/`URLSearchParams` instead. See `app/(main)/search/search-results.tsx:13` and `components/display-results.tsx:26`.
- [x] Decide the watchlist scope: keep watchlists out of the product promise until implemented; remove watchlist language from the login copy and README.
- [x] Fix the lint tooling mismatch. Migrate the repository to ESLint 9 flat config so `pnpm exec eslint .` and `pnpm lint` pass.
- [x] Add an authenticated Postgres concurrency integration test for `claim_free_recommendation()`.

### Low priority

- [x] Replace the logo `<img>` with `next/image` to remove the Next.js optimization warning. See `components/logo.tsx:8`.
