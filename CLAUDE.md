# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Starting the Development Server
```bash
npm run dev
```
Starts the Next.js development server with Turbopack on http://localhost:3000

### Building and Production
```bash
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint checks
```

## Environment Setup

### Required Environment Variables
Copy `.env.local.example` to `.env.local` and configure:

- `GITHUB_TOKEN`: GitHub personal access token for API access
- `NEXT_PUBLIC_GITHUB_USERNAMES`: Comma-separated list of usernames for dropdown (optional)
- Honeycomb observability variables (optional):
  - `NEXT_PUBLIC_HONEYCOMB_API_KEY`
  - `NEXT_PUBLIC_HONEYCOMB_SERVICE_NAME`
  - `NEXT_PUBLIC_ENVIRONMENT`

## Architecture Overview

This is a Next.js 15 application that analyzes GitHub activity for performance reviews. Key architectural patterns:

- **Frontend Observability**: Honeycomb integration for tracking user interactions and API performance
- **API Proxy Pattern**: GitHub API calls are proxied through `/api/fetch-contributions` to keep tokens secure
- **Client-Side State Management**: React hooks manage form state and API responses
- **Collapsible UI**: Statistics are organized into expandable sections

### Key Components

- `src/app/page.tsx`: Main UI with form handling and observability spans
- `src/app/api/fetch-contributions/route.ts`: GitHub API proxy endpoint
- `src/lib/github.ts`: GitHub API integration with parallel data fetching
- `src/lib/honeycomb.ts`: Observability utilities and custom span creation
- `src/components/HoneycombProvider.tsx`: Client-side observability initialization

### Data Flow

1. User submits form → `page.tsx` creates observability span
2. Frontend calls `/api/fetch-contributions` → Proxies to GitHub API
3. `github.ts` makes parallel requests for different contribution types
4. Response formatted into summary stats and collapsible sections
5. Custom attributes added to observability spans for tracking

### GitHub API Integration

The app fetches multiple contribution types in parallel:
- Merged PRs, Draft PRs, Closed PRs (non-merged)
- Reviewed PRs (where user commented but didn't author)
- Issues opened
- All comments (issue comments + PR review comments)

All GitHub searches use date ranges and are paginated for completeness.