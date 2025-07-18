"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import React from "react";
import { useState as useTooltipState } from "react";

type Item = {
  title: string;
  url: string;
  repo?: string;
};

export default function CollapsibleSection({
  title,
  items,
}: {
  title: string;
  items: Item[];
}) {
  const [open, setOpen] = useState(true);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  // Track prefix for each item
  const [prefixes, setPrefixes] = useState<("" | "-" | "+" | "=")[]>(() => items.map(() => ""));
  // Add this state at the top of the component, after other useState hooks:
  const [showTooltip, setShowTooltip] = useState<number | null>(null);

  // Update prefixes if items change (e.g., new search)
  React.useEffect(() => {
    setPrefixes(items.map(() => ""));
  }, [items]);

  const handlePrefix = (idx: number, prefix: "-" | "+" | "=") => {
    setPrefixes((prev) => prev.map((p, i) => (i === idx ? prefix : p)));
  };

  const handleCopyAll = async () => {
    if (!items.length) return;

    // Sort items by the repo field
    const sorted = items.map((item, idx) => ({ ...item, idx }));
    sorted.sort((a, b) => {
      const repoA = a.repo?.toLowerCase() || "";
      const repoB = b.repo?.toLowerCase() || "";
      return repoA.localeCompare(repoB);
    });

    // Format as a bulleted Markdown list, including prefix before the link text
    const markdownLinks = sorted
      .map((item) => {
        const prefix = prefixes[item.idx] ? `(${prefixes[item.idx]}) ` : "";
        return `* ${prefix}[${item.title}](${item.url}) (${item.repo})`;
      })
      .join("\n");

    try {
      await navigator.clipboard.writeText(markdownLinks);
      setCopySuccess(`Copied ${items.length} links!`);
      setTimeout(() => setCopySuccess(null), 3000);
    } catch (err) {
      setCopySuccess("Failed to copy");
    }
  };

  return (
    <div className="mb-4 border rounded">
      <div className="flex items-center justify-between w-full p-2 bg-gray-100 rounded-t">
        {/* Toggle icon on the left */}
        <button
          onClick={() => setOpen(!open)}
          className="mr-2 text-gray-600 hover:text-black"
          aria-label="Toggle section"
        >
          <span
            className={`inline-block transform transition-transform ${
              open ? "rotate-90" : ""
            }`}
          >
            ▶
          </span>
        </button>

        {/* Title */}
        <h2 className="font-semibold flex-grow flex items-center gap-2">
          {title} ({items.length})
        </h2>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyAll}
            disabled={!items.length}
            className="text-sm text-blue-600 hover:underline disabled:opacity-50"
          >
            Copy All Links
          </button>
          {copySuccess && (
            <span className="text-xs text-green-600">{copySuccess}</span>
          )}
        </div>
      </div>

      {open && (
        <ul className="divide-y">
          {items.map((item, idx) => (
            <li
              key={idx}
              className="flex items-center justify-between px-4 py-2"
            >
              <div className="flex flex-col">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline"
                >
                  {prefixes[idx] ? `(${prefixes[idx]}) ` : ""}
                  {item.title}
                </a>
                {item.repo && (
                  <span className="text-xs text-gray-500">{item.repo}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  aria-label="Mark as minus"
                  className="w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold bg-red-100 text-red-600 border border-red-300 hover:bg-red-200"
                  style={{ minWidth: 24, minHeight: 24 }}
                  onClick={() => handlePrefix(idx, "-")}
                >
                  –
                </button>
                <button
                  aria-label="Mark as equal"
                  className="w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold bg-blue-100 text-blue-600 border border-blue-300 hover:bg-blue-200"
                  style={{ minWidth: 24, minHeight: 24 }}
                  onClick={() => handlePrefix(idx, "=")}
                >
                  =
                </button>
                <button
                  aria-label="Mark as plus"
                  className="w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold bg-green-100 text-green-600 border border-green-300 hover:bg-green-200"
                  style={{ minWidth: 24, minHeight: 24 }}
                  onClick={() => handlePrefix(idx, "+")}
                >
                  +
                </button>
                <button
                  onClick={() => {
                    const prefix = prefixes[idx] ? `(${prefixes[idx]}) ` : "";
                    navigator.clipboard.writeText(
                      `${prefix}[${item.title}](${item.url})`
                    );
                    toast.success("Copied markdown to clipboard");
                  }}
                  className="text-sm text-gray-500 hover:text-gray-800"
                >
                  📋
                </button>
                <div className="relative flex items-center">
                  <button
                    aria-label="Help: What do these symbols and buttons mean?"
                    className="ml-1 text-gray-400 hover:text-gray-700 focus:outline-none"
                    onMouseEnter={() => setShowTooltip(idx + 2000)}
                    onMouseLeave={() => setShowTooltip(null)}
                    tabIndex={0}
                    onFocus={() => setShowTooltip(idx + 2000)}
                    onBlur={() => setShowTooltip(null)}
                    style={{ width: 20, height: 20 }}
                  >
                    <span className="text-lg font-bold">?</span>
                  </button>
                  {showTooltip === idx + 2000 && (
                    <div className="absolute left-6 top-1 z-10 w-72 p-2 bg-white border border-gray-300 rounded shadow text-xs text-gray-700">
                      <div className="mb-1">
                        <b>–</b> area for growth, <b>=</b> solid example of
                        expected work, <b>+</b> standout contribution. Use these
                        to quickly highlight the nature of this PR. The{" "}
                        <span className="inline-block">📋</span> button copies
                        this line in markdown format for easy sharing.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
