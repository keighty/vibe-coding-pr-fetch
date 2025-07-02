"use client";

import { useState } from "react";
import toast from "react-hot-toast";

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

  const handleCopyAll = async () => {
    if (!items.length) return;

    // Sort items by the repo field
    const sortedItems = [...items].sort((a, b) => {
      const repoA = a.repo?.toLowerCase() || "";
      const repoB = b.repo?.toLowerCase() || "";
      return repoA.localeCompare(repoB);
    });

    // Format as a bulleted Markdown list
    const markdownLinks = sortedItems
      .map((item) => `* [${item.title}](${item.url}) (${item.repo})`)
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
        <h2 className="font-semibold flex-grow">
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
                  {item.title}
                </a>
                {item.repo && (
                  <span className="text-xs text-gray-500">{item.repo}</span>
                )}
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(`[${item.title}](${item.url})`);
                  toast.success("Copied markdown to clipboard");
                }}
                className="text-sm text-gray-500 hover:text-gray-800"
              >
                📋
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
