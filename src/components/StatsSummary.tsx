type Stats = {
  totalMergedPRs: number
  totalReviewedPRs: number
  totalDraftPRs: number
  totalClosedPRs: number
  totalIssuesOpened: number
  totalComments: number
  avgTimeToMerge: string | null
}

export default function StatsSummary({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-2 gap-4 border p-4 rounded bg-white shadow">
      <Stat label="Merged PRs" value={stats.totalMergedPRs} />
      <Stat label="PRs Reviewed" value={stats.totalReviewedPRs} />
      <Stat label="Draft PRs" value={stats.totalDraftPRs} />
      <Stat label="Closed PRs" value={stats.totalClosedPRs} />
      <Stat label="Issues Opened" value={stats.totalIssuesOpened} />
      <Stat label="Comments Made" value={stats.totalComments} />
      <Stat label="Avg Time to Merge" value={stats.avgTimeToMerge || '—'} />
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="text-sm">
      <div className="text-gray-500">{label}</div>
      <div className="font-semibold text-lg">{value}</div>
    </div>
  )
}
