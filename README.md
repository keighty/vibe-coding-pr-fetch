# 🛠️ GitHub Performance Review Tool

A secure, local-only web app to help engineering managers review GitHub activity over a selected date range. Built with Next.js App Router, Tailwind CSS, and GitHub's REST API.

---

## ✨ Features

- Secure input form for GitHub username and date range
- Summary statistics:
  - Merged PRs, Draft PRs, Closed PRs, Issues Opened, Comments Made
  - Average time to merge PRs
- Collapsible sections for:
  - Merged PRs
  - Draft PRs
  - Closed PRs
  - Issues Opened
  - Comments Made
- Copy-to-Markdown shortcut for each PR or issue
- Graceful error handling for invalid tokens, users, or empty results

---

## 🚀 Getting Started

```bash
git clone <your-repo-url>
cd github-performance-review

cp .env.local.example .env.local
# Add your GitHub token to .env.local

npm install
npm run dev
```

Visit http://localhost:3000

## 🔐 GitHub Token Instructions
Go to https://github.com/settings/tokens

* Click Generate new token (fine-grained)
* Choose expiration (recommended: 7–30 days)
* Select specific repositories, or all if needed
* Enable the following read-only scopes:

#### ✅ Required Permissions
Repository Permissions
* Contents – Read-only
* Metadata – Read-only
* Pull requests – Read-only
* Issues – Read-only

#### Organization Permissions (if using org repos)
* Organization members – Read-only

#### Account Permissions
* Profile – Read-only

Copy the generated token and add it to .env.local like:

```
GITHUB_TOKEN=ghp_your_token_here
```
Restart the dev server:

## GitHub Username Dropdown

To enable a dropdown for GitHub usernames, add a `NEXT_PUBLIC_GITHUB_USERNAMES` variable to your `.env.local` file:

```
NEXT_PUBLIC_GITHUB_USERNAMES=octocat,hubot,otheruser
```

If `NEXT_PUBLIC_GITHUB_USERNAMES` is not set, a text input will be shown instead. The dropdown will be populated with the usernames from this list.

## 📊 Honeycomb Frontend Observability

This application is instrumented with Honeycomb for Frontend Observability to provide insights into user interactions, performance metrics, and API calls.

### 🔧 Setup Instructions

1. **Get your Honeycomb API Key:**
   - Sign up at [Honeycomb.io](https://www.honeycomb.io/)
   - Navigate to [Account Settings](https://ui.honeycomb.io/account)
   - Create a new API key or use an existing one

2. **Configure Environment Variables:**
   Add the following to your `.env.local` file:
   ```bash
   NEXT_PUBLIC_HONEYCOMB_API_KEY=your_honeycomb_api_key_here
   NEXT_PUBLIC_HONEYCOMB_SERVICE_NAME=github-contributions-frontend
   NEXT_PUBLIC_ENVIRONMENT=development
   ```

3. **Restart your development server:**
   ```bash
   npm run dev
   ```

### 📈 What's Being Tracked

The application automatically tracks:

- **🌐 Network Requests:** All fetch calls to the GitHub API
- **👆 User Interactions:** Button clicks, form submissions, and navigation
- **📄 Page Loads:** Document load times and performance metrics
- **⚡ Web Vitals:** Core Web Vitals (LCP, FID, CLS) for performance monitoring
- **🔧 Custom Events:** GitHub contribution fetches with detailed metadata

### 🏷️ Custom Attributes

Each GitHub contribution request includes:
- `github.username` - The GitHub username being queried
- `github.startDate` - Start date of the query range
- `github.endDate` - End date of the query range
- `request.type` - Type of request (github-contributions)
- `response.success` - Whether the request succeeded
- `response.sections_count` - Number of sections in the response
- `error.status` - HTTP status code for failed requests
- `error.message` - Error message for debugging

### 🔍 Viewing Your Data

1. Log into your [Honeycomb dashboard](https://ui.honeycomb.io/)
2. Select your dataset (service name)
3. Explore traces and spans to understand:
   - User journey through the application
   - API response times and error rates
   - Performance bottlenecks
   - User interaction patterns

### 🚫 Disabling Observability

To disable Honeycomb tracking, simply remove or comment out the `NEXT_PUBLIC_HONEYCOMB_API_KEY` environment variable. The application will continue to work normally without sending telemetry data.

### 🔒 Privacy & Security

- Only frontend performance and interaction data is collected
- No sensitive user data or GitHub tokens are sent to Honeycomb
- All data is transmitted securely over HTTPS
- You control your own Honeycomb account and data retention policies

## 🛡️ Security Notes
* Your GitHub token is used only on the backend
* It is never stored, never sent to the client, and never logged
* This app stores no user data and does not persist anything

## File Structure
```
src/
├── app/
│   ├── api/fetch-contributions/route.ts     # GitHub API proxy
│   ├── layout.tsx                           # Root layout with Honeycomb provider
│   └── page.tsx                             # Main UI with observability
├── components/
│   ├── CollapsibleSection.tsx               # For each contribution category
│   ├── HoneycombProvider.tsx                # Honeycomb initialization
│   └── StatsSummary.tsx                     # Summary section
├── lib/
│   ├── github.ts                            # GitHub API helpers
│   └── honeycomb.ts                         # Honeycomb configuration & utilities
.env.local.example                           # Token & Honeycomb config example
README.md                                     # Project documentation
setup-honeycomb.md                           # Detailed Honeycomb setup guide
```

## 🧪 Todo / Nice to Have
* Support for PRs reviewed (requires per-repo fetch)
* Dark mode toggle
* Export to CSV or Markdown report
* Pagination for large datasets
