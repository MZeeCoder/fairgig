"use client";

import { useState } from "react";
import { Filter, Loader2, Download } from "lucide-react";

const allHistory = [
  { id: 1, date: "2025-07-15", platform: "Uber", hours: 6.5, net: 4850, status: "Confirmed" },
  { id: 2, date: "2025-07-14", platform: "Foodpanda", hours: 4.0, net: 2450, status: "Pending" },
  { id: 3, date: "2025-07-10", platform: "Bykea", hours: 8.0, net: 5800, status: "Flagged" },
  { id: 4, date: "2025-06-28", platform: "Uber", hours: 5.5, net: 3900, status: "Confirmed" },
  { id: 5, date: "2025-06-15", platform: "Foodpanda", hours: 7.0, net: 4100, status: "Confirmed" },
];

export default function HistoryPage() {
  const [filter, setFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    setIsLoading(true);
    // Fake network delay when changing filters
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };

  return (
    <main className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Earnings History</h1>
          <p className="text-sm text-slate-500 mt-1">Review your verified and pending income.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Filter className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <select 
              value={filter}
              onChange={handleFilterChange}
              className="pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 appearance-none cursor-pointer"
            >
              <option value="all">All Time</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
          <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-sm px-4 py-2 rounded-lg transition-colors">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-teal-600 animate-spin mb-4" />
            <p className="text-sm text-slate-500">Loading records...</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Platform</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Hours</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Net Earned</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allHistory.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-600">{log.date}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{log.platform}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{log.hours}h</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900">PKR {log.net.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                      log.status === 'Confirmed' ? 'bg-teal-50 text-teal-700' :
                      log.status === 'Pending' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}