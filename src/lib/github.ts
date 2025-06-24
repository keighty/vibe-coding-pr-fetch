const GITHUB_TOKEN = process.env.GITHUB_TOKEN

if (!GITHUB_TOKEN) {
  throw new Error('Missing GITHUB_TOKEN in environment')
}

const headers = {
  Authorization: `Bearer ${GITHUB_TOKEN}`,
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
}

export async function fetchUserContributions(username: string, start: string, end: string) {
  const [mergedPRs] = await Promise.all([
    getMergedPRs(username, start, end),
    // more categories later
  ])

  return {
    summary: {
      totalMergedPRs: mergedPRs.length,
      totalReviewedPRs: 0,
      totalDraftPRs: 0,
      totalClosedPRs: 0,
      totalIssuesOpened: 0,
      totalComments: 0,
      avgTimeToMerge: calculateAvgTimeToMerge(mergedPRs),
    },
    sections: {
      'Merged PRs': mergedPRs,
      'Reviewed PRs': [],
      'Draft PRs': [],
      'Closed PRs': [],
      'Issues Opened': [],
      'Comments Made': [],
    },
  }
}

async function getMergedPRs(username: string, start: string, end: string) {
  const query = [
    `type:pr`,
    `author:${username}`,
    `is:merged`,
    `merged:${start}..${end}`,
  ].join(' ')

  const url = `https://api.github.com/search/issues?q=${encodeURIComponent(query)}&per_page=100`

  const res = await fetch(url, { headers })

  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.message || 'Failed to fetch merged PRs')
  }

  const result = await res.json()

  return result.items.map((pr: any) => ({
    title: pr.title,
    url: pr.html_url,
    createdAt: pr.created_at,
    mergedAt: pr.closed_at, // 'closed_at' is the merge time for merged PRs
  }))
}

function calculateAvgTimeToMerge(prs: { createdAt: string; mergedAt: string }[]) {
  if (prs.length === 0) return null

  const totalMillis = prs.reduce((sum, pr) => {
    return sum + (new Date(pr.mergedAt).getTime() - new Date(pr.createdAt).getTime())
  }, 0)

  const avgMillis = totalMillis / prs.length
  const days = avgMillis / (1000 * 60 * 60 * 24)

  return `${days.toFixed(1)} days`
}