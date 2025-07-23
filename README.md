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

## 🛡️ Security Notes
* Your GitHub token is used only on the backend
* It is never stored, never sent to the client, and never logged
* This app stores no user data and does not persist anything

## File Structure
```
src/
├── app/
│   ├── api/fetch-contributions/route.ts     # GitHub API proxy
│   └── page.tsx                             # Main UI
├── components/
│   ├── CollapsibleSection.tsx               # For each contribution category
│   └── CollapsibleStats.tsx                 # Summary section
├── lib/
│   └── github.ts                            # GitHub API helpers
.env.local.example                           # Token example config
README.md                                     # Project documentation
```

## 🧪 Todo / Nice to Have
* Support for PRs reviewed (requires per-repo fetch)
* Dark mode toggle
* Export to CSV or Markdown report
* Pagination for large datasets
