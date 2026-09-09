# Cinemotion — AI Movie & Series Discovery

Cinemotion is a Next.js application for discovering movies and TV series through search, browsing, pagination, detail pages, and an AI-assisted recommendation flow.

**Live demo:** [movies-tv-app-with-ai.vercel.app](https://movies-tv-app-with-ai.vercel.app)

## What it demonstrates

- **AI-assisted discovery:** users choose a mood, story type, and setting; the app sends those preferences to a Groq-powered route and resolves the recommendation through TMDB.
- **Movie and TV search:** search by media type with URL-based query state and paginated results.
- **Media details:** open a dedicated detail view with title, genres, overview, release information, and artwork.
- **Reusable UI:** responsive Tailwind CSS layouts with Radix/shadcn-style components, loading states, dialogs, tabs, forms, and pagination.
- **Typed form handling:** React Hook Form and Zod validation for search and recommendation inputs.
- **Client state:** Zustand stores for UI and result state, with debounced search interactions.
- **Public browsing with account-based picks:** Supabase Auth keeps browsing public while protecting each account's three free AI recommendations.
- **Personal persistence:** signed-in users get a protected profile and recommendation history in Supabase Postgres.

## User flow

1. Browse movie or TV content from the main page.
2. Search for a title and move through paginated results.
3. Open a result to view its details.
4. Open the recommendation flow and sign in when you are ready to submit.
5. Choose a mood, story type, and setting, then receive one of three free AI picks.
6. Save successful recommendation history for the account.

## Architecture

- **Next.js App Router:** route groups separate the main browsing experience from detail pages.
- **Recommendation API:** `app/api/recommend/route.ts` calls Groq through the OpenAI-compatible SDK and then searches TMDB for the returned title.
- **TMDB integration:** server routes handle movie lists, search, details, and AI recommendation lookups without exposing the credential to the browser.
- **Validation:** Zod schemas are connected to React Hook Form through `@hookform/resolvers`.
- **UI state:** Zustand manages client-side modal and result state.
- **Auth and database:** Supabase SSR clients manage cookie sessions; Postgres stores profiles and recommendation history with Row Level Security.

## Tech stack

- Next.js 15
- React 18
- TypeScript
- Tailwind CSS
- Radix UI / shadcn-style components
- Zustand
- React Hook Form + Zod
- Axios
- Groq API
- TMDB API
- Supabase Auth + Postgres

## Getting started

### Prerequisites

- Node.js 18+
- npm, pnpm, or another Node.js package manager
- A Groq API key
- A TMDB API key or read access token
- A Supabase project (the repository includes the initial migration)

### Installation

```bash
git clone https://github.com/abdelrhmanehab10/movies-tv-app-with-ai.git
cd movies-tv-app-with-ai
npm install
```

Create a `.env.local` file in the project root:

```env
GROQ_API_KEY=your_groq_api_key
TMDB_API_KEY=your_tmdb_api_key_or_read_access_token
NEXT_PUBLIC_IMAGE_URL=https://image.tmdb.org/t/p/w500
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

`NEXT_PUBLIC_IMAGE_URL` is optional; the app defaults to the URL above when it is not set.
`TMDB_API_KEY` is server-only; never give it a `NEXT_PUBLIC_` prefix. Do not
commit `.env.local` or expose secret values in source control.

### Database setup

The repository includes Supabase CLI configuration and versioned migrations. After authenticating and linking the hosted project, apply them with:

```bash
pnpm supabase login
pnpm supabase link --project-ref your-project-ref
pnpm supabase db push
```

The migrations create the account tables and an atomic three-pick recommendation quota. Browsing stays public, but AI recommendations require a signed-in user. Quota claims use that user's Supabase identity, while provider-failure refunds use the server-only `SUPABASE_SERVICE_ROLE_KEY`; never give that key a `NEXT_PUBLIC_` prefix.

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production build

```bash
npm run build
npm run start
```

## Project structure

```text
app/
├── (auth)/                 # Sign-in and account creation
├── (main)/                 # Browse, search, recommendation UI
├── api/recommend/          # Groq + TMDB recommendation route
├── api/tmdb/               # Server-only TMDB browse routes
├── auth/callback/          # Supabase auth callback
└── detail/                 # Media detail page
components/                 # Reusable UI and result components
hooks/                      # Zustand stores and shared hooks
lib/supabase/               # Browser, server, and middleware clients
supabase/migrations/        # Versioned Postgres schema and RLS policies
schemas/                    # Zod validation schemas
types/                      # Shared TypeScript types
```

## Engineering highlights

- Keeps Groq, TMDB, and Supabase service credentials on the server.
- Uses URL query parameters to make search state shareable and navigable.
- Separates API calls, validation schemas, shared components, and page-level UI.
- Includes dependency and security-maintenance updates in the project history.

## License

This project is licensed under the MIT License.
