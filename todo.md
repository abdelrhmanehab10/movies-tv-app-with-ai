# Todo

- [ ] Limit free AI recommendations to 3 picks per authenticated user. Add a Supabase quota table, an atomic server-side claim function, `AUTH_REQUIRED` and `FREE_LIMIT_REACHED` responses, remaining-picks feedback in the UI, and tests for concurrent requests and provider failures. See [the research note](research/free-pick-limit-for-cinemotion.md).
- [ ] Persist the latest recommendation result in browser `localStorage` so it survives page refreshes, with safe parsing, a versioned storage key, and clear/reset behavior when the user requests another pick.
