# FunCity 🗽

An NYC-themed Reddit clone where users discuss and share the best spots across the five boroughs.

## Features

- 🏙️ **10 Pre-built Communities** — 5 NYC boroughs + 5 topic categories (Food, Art, Nightlife, Hidden Gems, Nature)
- 📝 **Posts** — Title, body text, and optional image URLs
- ⬆️ **Upvote / Downvote** — On both posts and comments
- 💬 **Nested Comments** — Threaded reply chains with voting
- 🔥 **Hot / New / Top Sorting** — Reddit-style hot ranking algorithm
- 👤 **User Profiles** — Karma tracking, post history
- 🔐 **Username + Password Auth** — With demographic collection (age group, country, NYC familiarity)
- 🌙 **Dark Mode Neon Aesthetic** — Cyberpunk-inspired UI
- 📈 **PostHog Analytics** — All events tagged with user demographics, full autocapture + session recording

## Getting Started

1. Clone the repository
2. Copy `.env.example` to `.env.local` and fill in your keys (Supabase URL, anon key, PostHog key, AUTH_SECRET)
3. Run the SQL in `supabase/combined_setup.sql` in your Supabase SQL Editor
4. Install dependencies: `npm install`
5. Run the dev server: `npm run dev`
6. Sign up with a new account or log in as the demo user: `nyclocal` / `demo1234`

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** Supabase (PostgreSQL)
- **Auth:** Custom username/password with bcrypt hashing
- **Analytics:** PostHog (autocapture, session recording, custom events)
- **Styling:** Tailwind CSS + dark mode neon theme
- **Language:** TypeScript

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout (dark theme, providers)
│   ├── page.tsx                # Home feed
│   ├── login/                  # Login page
│   ├── signup/                 # Signup page with demographics
│   ├── submit/                 # Create post page
│   ├── r/[name]/               # Subreddit pages
│   ├── post/[id]/              # Post detail + comments
│   ├── user/[username]/        # User profile
│   └── api/                    # 12 API routes
├── components/                 # Shared UI components
├── data/                       # Countries list
├── lib/                        # Supabase client, auth, analytics, types
└── providers/                  # PostHog + Auth providers
```
