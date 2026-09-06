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

## User flow

1. Browse movie or TV content from the main page.
2. Search for a title and move through paginated results.
3. Open a result to view its details.
4. Open the recommendation flow and choose a mood, story type, and setting.
5. Receive an AI-generated title and resolve it to a TMDB media result.

## Architecture

- **Next.js App Router:** route groups separate the main browsing experience from detail pages.
- **Recommendation API:** `app/api/recommend/route.ts` calls Groq through the OpenAI-compatible SDK and then searches TMDB for the returned title.
- **TMDB integration:** movie, TV, multi-search, and detail requests are handled through Axios.
- **Validation:** Zod schemas are connected to React Hook Form through `@hookform/resolvers`.
- **UI state:** Zustand manages client-side modal and result state.

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

## Getting started

### Prerequisites

- Node.js 18+
- npm, pnpm, or another Node.js package manager
- A Groq API key
- A TMDB API key or read access token

### Installation

```bash
git clone https://github.com/abdelrhmanehab10/movies-tv-app-with-ai.git
cd movies-tv-app-with-ai
npm install
```

Create a `.env.local` file in the project root:

```env
GROQ_API_KEY=your_groq_api_key
NEXT_PUBLIC_API_KEY=your_tmdb_api_key_or_read_access_token
NEXT_PUBLIC_IMAGE_URL=https://image.tmdb.org/t/p/w500
```

`NEXT_PUBLIC_IMAGE_URL` is optional; the app defaults to the URL above when it is not set.
Do not commit `.env.local` or expose secret values in source control.

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
├── (main)/                 # Browse, search, recommendation UI
├── api/recommend/          # Groq + TMDB recommendation route
└── detail/                 # Media detail page
components/                 # Reusable UI and result components
hooks/                      # Zustand stores and shared hooks
schemas/                    # Zod validation schemas
types/                      # Shared TypeScript types
```

## Engineering highlights

- Keeps recommendation credentials on the server-side Groq route.
- Uses URL query parameters to make search state shareable and navigable.
- Separates API calls, validation schemas, shared components, and page-level UI.
- Includes dependency and security-maintenance updates in the project history.

## License

This project is licensed under the MIT License.
