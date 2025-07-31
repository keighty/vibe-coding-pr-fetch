"use client";

import { useState } from "react";
import StatsSummary from "@/components/StatsSummary";
import CollapsibleSection from "@/components/CollapsibleSection";
import { createCustomSpan, addCustomAttributes } from "@/lib/honeycomb";
import React from "react";

// Get usernames from env at build time (client-safe)
const usernamesFromEnv = process.env.NEXT_PUBLIC_GITHUB_USERNAMES
  ? process.env.NEXT_PUBLIC_GITHUB_USERNAMES.split(',').map(u => u.trim()).filter(Boolean)
  : null;

export default function HomePage() {
  const [username, setUsername] = useState("");
  const [startDate, setStartDate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const today = new Date().toISOString().split("T")[0]; // yyyy-mm-dd
  const [endDate, setEndDate] = useState(today);
  const usernames = usernamesFromEnv;

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    await createCustomSpan(
      'github-contributions-fetch',
      async () => {
        try {
          // Add custom attributes to track the request
          addCustomAttributes({
            'github.startDate': startDate,
            'github.endDate': endDate,
            'request.type': 'github-contributions'
          });

          const res = await fetch("/api/fetch-contributions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, startDate, endDate }),
          });

          if (!res.ok) {
            const data = await res.json();
            // Add error attributes
            addCustomAttributes({
              'error.status': res.status,
              'error.message': data.message || "Something went wrong"
            });
            throw new Error(data.message || "Something went wrong");
          }

          const result = await res.json();
          
          // Add success attributes
          addCustomAttributes({
            'response.success': true,
            'response.sections_count': Object.keys(result.sections || {}).length,
            'response.has_summary': !!result.summary
          });
          
          setData(result);
        } catch (e: any) {
          addCustomAttributes({
            'error.caught': true,
            'error.message': e.message
          });
          setError(e.message);
          throw e; // Re-throw to ensure span is marked as error
        } finally {
          setLoading(false);
        }
      },
      {
        'operation.type': 'user-action',
        'component': 'HomePage'
      }
    );
  };

  return (
    <main className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">GitHub Performance Review</h1>

      <div className="space-y-4 mb-6">
        {usernames && usernames.length > 0 ? (
          <select
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          >
            <option value="">Select GitHub Username</option>
            {usernames.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="GitHub Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        )}

        <div className="flex space-x-2">
          <input
            type="date"
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="date"
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            max={today}
          />
        </div>

        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Loading..." : "Submit"}
        </button>
      </div>

      {error && <p className="text-red-600 font-medium">{error}</p>}
      {data && (
        <div className="space-y-6">
          <StatsSummary stats={data.summary} />
          {Object.entries(data.sections).map(([title, items]) => (
            <CollapsibleSection key={title} title={title} items={items} />
          ))}
        </div>
      )}
    </main>
  );
}
