const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
  throw new Error("Missing GITHUB_TOKEN in environment");
}

const headers = {
  Authorization: `Bearer ${GITHUB_TOKEN}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
};

export async function fetchUserContributions(
  username: string,
  start: string,
  end: string
) {
  const [mergedPRs, reviewedPRs, draftPRs, closedPRs, issuesOpened, comments] =
    await Promise.all([
      getMergedPRs(username, start, end),
      getReviewedPRs(username, start, end),
      getDraftPRs(username, start, end),
      getClosedPRs(username, start, end),
      getIssuesOpened(username, start, end),
      getUserComments(username, start, end),
    ]);

  return {
    summary: {
      totalMergedPRs: mergedPRs.length,
      totalReviewedPRs: reviewedPRs.length,
      totalDraftPRs: draftPRs.length,
      totalClosedPRs: closedPRs.length,
      totalIssuesOpened: issuesOpened.length,
      totalComments: comments.length,
      avgTimeToMerge: calculateAvgTimeToMerge(mergedPRs),
    },
    sections: {
      "Merged PRs": mergedPRs,
      "Reviewed PRs": reviewedPRs,
      "Draft PRs": draftPRs,
      "Closed PRs": closedPRs,
      "Issues Opened": issuesOpened,
      "Comments Made": comments,
    },
  };
}

async function getMergedPRs(username: string, start: string, end: string) {
  const query = [
    `type:pr`,
    `author:${username}`,
    `is:merged`,
    `merged:${start}..${end}`,
  ].join(" ");

  const url = `https://api.github.com/search/issues?q=${encodeURIComponent(
    query
  )}&per_page=100`;

  const res = await fetch(url, { headers });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || "Failed to fetch merged PRs");
  }

  const result = await res.json();
  const sorted = formatItems(result.items);
  return sorted;
}

function calculateAvgTimeToMerge(
  prs: { createdAt: string; mergedAt: string }[]
) {
  if (prs.length === 0) return null;

  const totalMillis = prs.reduce((sum, pr) => {
    return (
      sum + (new Date(pr.mergedAt).getTime() - new Date(pr.createdAt).getTime())
    );
  }, 0);

  const avgMillis = totalMillis / prs.length;
  const days = avgMillis / (1000 * 60 * 60 * 24);

  return `${days.toFixed(1)} days`;
}

async function getReviewedPRs(username: string, start: string, end: string) {
  const query = [
    `type:pr`,
    `commenter:${username}`,
    `updated:${start}..${end}`,
  ].join(" ");

  const url = `https://api.github.com/search/issues?q=${encodeURIComponent(
    query
  )}&per_page=100`;
  const res = await fetch(url, { headers });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || "Failed to fetch reviewed PRs");
  }

  const result = await res.json();

  // Filter out PRs authored by the user (only reviews of others)
  const reviewed = result.items.filter((pr: any) => pr.user.login !== username);

  const sorted = formatItems(reviewed);
  return sorted;
}

async function getDraftPRs(username: string, start: string, end: string) {
  const query = [
    "type:pr",
    "is:open",
    "is:draft",
    `author:${username}`,
    `created:${start}..${end}`,
  ].join(" ");

  const url = `https://api.github.com/search/issues?q=${encodeURIComponent(
    query
  )}&per_page=100`;
  const res = await fetch(url, { headers });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || "Failed to fetch draft PRs");
  }

  const result = await res.json();
  const sorted = formatItems(result.items);
  return sorted;
}

async function getClosedPRs(username: string, start: string, end: string) {
  const query = [
    "type:pr",
    "is:closed",
    `author:${username}`,
    `closed:${start}..${end}`,
    "-is:merged", // exclude merged
  ].join(" ");

  const url = `https://api.github.com/search/issues?q=${encodeURIComponent(
    query
  )}&per_page=100`;
  const res = await fetch(url, { headers });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || "Failed to fetch closed PRs");
  }

  const result = await res.json();
  const sorted = formatItems(result.items);
  return sorted;
}

async function getUserComments(username: string, start: string, end: string) {
  const comments: { title: string; url: string; createdAt: string }[] = [];

  // Helper to paginate any GitHub REST endpoint
  async function fetchAllPages(url: string) {
    const results = [];
    let page = 1;

    while (true) {
      const res = await fetch(`${url}?per_page=100&page=${page}`, { headers });
      if (!res.ok) break;

      const pageData = await res.json();
      results.push(...pageData);

      if (pageData.length < 100) break;
      page++;
    }

    return results;
  }

  // Filter helper
  function isInDateRange(dateStr: string, start: string, end: string) {
    const d = new Date(dateStr);
    return d >= new Date(start) && d <= new Date(end);
  }

  // 1. Issue + PR top-level comments
  const issueComments = await fetchAllPages(
    `https://api.github.com/users/${username}/issues/comments`
  );
  for (const c of issueComments) {
    if (isInDateRange(c.created_at, start, end)) {
      comments.push({
        title: c.body?.slice(0, 80).replace(/\n/g, " ") + "...",
        url: c.html_url,
        createdAt: c.created_at,
      });
    }
  }

  // 2. Inline review comments on pull requests
  const prComments = await fetchAllPages(
    `https://api.github.com/users/${username}/pulls/comments`
  );
  for (const c of prComments) {
    if (isInDateRange(c.created_at, start, end)) {
      comments.push({
        title: c.body?.slice(0, 80).replace(/\n/g, " ") + "...",
        url: c.html_url,
        createdAt: c.created_at,
      });
    }
  }

  return comments;
}

async function getIssuesOpened(username: string, start: string, end: string) {
  const query = [
    "type:issue",
    `author:${username}`,
    `created:${start}..${end}`,
  ].join(" ");

  const url = `https://api.github.com/search/issues?q=${encodeURIComponent(
    query
  )}&per_page=100`;
  const res = await fetch(url, { headers });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || "Failed to fetch issues");
  }

  const result = await res.json();
  const sorted = formatItems(result.items);
  return sorted;
}

function formatItems(items) {
  return items.map((pr: any) => {
    const match = pr.html_url.match(/github\.com\/([^/]+\/[^/]+)\//);
    return {
      title: pr.title,
      url: pr.html_url,
      createdAt: pr.created_at,
      mergedAt: pr.closed_at,
      repo: match?.[1] || "Unknown Repo",
    };
  });
}
