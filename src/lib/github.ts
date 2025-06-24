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
  const [mergedPRs, reviewedPRs, draftPRs, closedPRs] = await Promise.all([
    getMergedPRs(username, start, end),
    getReviewedPRs(username, start, end),
    getDraftPRs(username, start, end),
    getClosedPRs(username, start, end),
  ])

  return {
    summary: {
      totalMergedPRs: mergedPRs.length,
      totalReviewedPRs: reviewedPRs.length,
      totalDraftPRs: draftPRs.length,
      totalClosedPRs: closedPRs.length,
      totalIssuesOpened: 0,
      totalComments: 0,
      avgTimeToMerge: calculateAvgTimeToMerge(mergedPRs),
    },
    sections: {
      'Merged PRs': mergedPRs,
      'Reviewed PRs': reviewedPRs,
      'Draft PRs': draftPRs,
      'Closed PRs': closedPRs,
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

async function getReviewedPRs(username: string, start: string, end: string) {
  const query = [
    `type:pr`,
    `commenter:${username}`,
    `updated:${start}..${end}`,
  ].join(' ')

  const url = `https://api.github.com/search/issues?q=${encodeURIComponent(query)}&per_page=100`
  const res = await fetch(url, { headers })

  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.message || 'Failed to fetch reviewed PRs')
  }

  const result = await res.json()

  // Filter out PRs authored by the user (only reviews of others)
  const reviewed = result.items.filter((pr: any) => pr.user.login !== username)

  return reviewed.map((pr: any) => ({
    title: pr.title,
    url: pr.html_url,
  }))
}

async function getDraftPRs(username: string, start: string, end: string) {
  const query = [
    'type:pr',
    'is:open',
    'is:draft',
    `author:${username}`,
    `created:${start}..${end}`,
  ].join(' ')

  const url = `https://api.github.com/search/issues?q=${encodeURIComponent(query)}&per_page=100`
  const res = await fetch(url, { headers })

  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.message || 'Failed to fetch draft PRs')
  }

  const result = await res.json()

  return result.items.map((pr: any) => ({
    title: pr.title,
    url: pr.html_url,
    createdAt: pr.created_at,
  }))
}

async function getClosedPRs(username: string, start: string, end: string) {
  const query = [
    'type:pr',
    'is:closed',
    `author:${username}`,
    `closed:${start}..${end}`,
    '-is:merged', // exclude merged
  ].join(' ')

  const url = `https://api.github.com/search/issues?q=${encodeURIComponent(query)}&per_page=100`
  const res = await fetch(url, { headers })

  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.message || 'Failed to fetch closed PRs')
  }

  const result = await res.json()

  return result.items.map((pr: any) => ({
    title: pr.title,
    url: pr.html_url,
    createdAt: pr.created_at,
    closedAt: pr.closed_at,
  }))
}

