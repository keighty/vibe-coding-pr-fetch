'use client'

import { useState } from 'react'

type Item = {
  title: string
  url: string
}

export default function CollapsibleSection({
  title,
  items,
}: {
  title: string
  items: Item[]
}) {
  const [open, setOpen] = useState(true)

  return (
    <div className="border rounded shadow-sm bg-white">
      <button
        className="w-full text-left px-4 py-2 font-semibold bg-gray-100 hover:bg-gray-200"
        onClick={() => setOpen(!open)}
      >
        {title} ({items.length})
      </button>
      {open && (
        <ul className="divide-y">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-center justify-between px-4 py-2">
              <a href={item.url} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                {item.title}
              </a>
              <button
                onClick={() => navigator.clipboard.writeText(`[${item.title}](${item.url})`)}
                className="text-sm text-gray-500 hover:text-gray-800"
              >
                📋
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
