import { useState } from "react";

type Stats = {
  totalMergedPRs: number;
  totalReviewedPRs: number;
  totalDraftPRs: number;
  totalClosedPRs: number;
  totalIssuesOpened: number;
  totalComments: number;
  avgTimeToMerge: string | null;
};

export default function StatsSummary({ stats }: { stats: Stats }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="border rounded shadow-sm bg-white">
      <button
        className="w-full text-left px-4 py-2 font-semibold bg-gray-100 hover:bg-gray-200"
        onClick={() => setOpen(!open)}
      >
        <span className="flex justify-between items-center w-full">
          <span>Summary Statistics</span>
          <span>merged: {stats.totalMergedPRs}</span>
          <span>reviewed: {stats.totalReviewedPRs}</span>
          <span
            className={`transform transition-transform ${
              open ? "rotate-90" : "rotate-0"
            }`}
          >
            ▶
          </span>
        </span>
      </button>

      {open && (
        <div className="grid grid-cols-2 gap-4 p-4 text-sm">
          <Stat label="Merged PRs" value={stats.totalMergedPRs} />
          <Stat label="PRs Reviewed" value={stats.totalReviewedPRs} />
          <Stat label="Draft PRs" value={stats.totalDraftPRs} />
          <Stat label="Closed PRs" value={stats.totalClosedPRs} />
          <Stat label="Issues Opened" value={stats.totalIssuesOpened} />
          <Stat label="Comments Made" value={stats.totalComments} />
          <Stat label="Avg Time to Merge" value={stats.avgTimeToMerge || "—"} />
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="text-sm">
      <div className="text-gray-500">{label}</div>
      <div className="font-semibold text-lg">{value}</div>
    </div>
  );
}
