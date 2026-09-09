# Todo

- [x] Limit free AI recommendations to 3 picks per authenticated user. Add a Supabase quota table, an atomic server-side claim function, `AUTH_REQUIRED` and `FREE_LIMIT_REACHED` responses, remaining-picks feedback in the UI, and tests for concurrent requests and provider failures. See [the research note](research/free-pick-limit-for-cinemotion.md).
- [x] Persist the latest recommendation result in browser `localStorage` so it survives page refreshes, with safe parsing, a versioned storage key, and clear/reset behavior when the user requests another pick.
- [x] Add a hint near the recommendation that signing in lets users save their recommended list.

## Review findings — 2026-09-09

### High priority

- [x] Protect the TMDB credential. Move browse, search, and detail requests behind server API routes and use a server-only `TMDB_API_KEY`; do not expose the credential through a public environment variable.
