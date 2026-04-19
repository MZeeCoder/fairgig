"use client";

import React, { useEffect, useState } from "react";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import { TrendingDown, Map, AlertOctagon, Activity, Loader2 } from "lucide-react";
import { fetchLiveAnalytics } from "../../../../services/advocate.api";

const PIE_COLORS = ["#4f46e5", "#0d9488", "#f59e0b", "#e11d48", "#6366f1", "#14b8a6"];

export default function AdvocateAnalyticsPanel() {
  const [data, setData] = useState({
    topComplaints: [],
    incomeByCity: [],
    commissionTrend: [],
    vulnerableWorkers: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const response = await fetchLiveAnalytics();
      if (response?.success && response?.data) {
        setData(response.data);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <main className="p-8 max-w-7xl mx-auto h-full flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </main>
    );
  }

  const { topComplaints: topComplaintsData, incomeByCity: incomeByCityData, commissionTrend: commissionTrendData, vulnerableWorkers } = data;

  const PLATFORM_COLORS = {
    Uber: "#4f46e5",
    Foodpanda: "#0d9488",
    Bykea: "#f59e0b",
    Careem: "#e11d48",
    InDrive: "#6366f1",
  };

  const platformsSet = new Set();
  commissionTrendData.forEach(month => {
    Object.keys(month).forEach(key => {
      if (key !== 'month') platformsSet.add(key);
    });
  });
  const platforms = Array.from(platformsSet);

  return (
    <main className="p-8 max-w-7xl mx-auto h-full overflow-y-auto bg-slate-50">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Activity className="w-8 h-8 text-indigo-600" />
          System Analytics & Vulnerability
        </h1>
        <p className="text-slate-500 mt-2">
          Aggregate platform metrics and at-risk worker flags.
        </p>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        


        {/* Bar Chart (Horizontal) */}
        <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow lg:col-span-2">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-amber-500" />
            Top Complaint Categories (This Week)
          </h2>
          <div className="h-72 w-full">
            {topComplaintsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topComplaintsData} layout="vertical" margin={{ left: 50 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                  <XAxis type="number" tick={{ fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="category" type="category" tick={{ fill: "#475569", fontWeight: 500 }} width={120} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: "#f8fafc" }}
                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={32}>
                    {topComplaintsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? "#e11d48" : index === 1 ? "#f59e0b" : "#4f46e5"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">No complaints data available</div>
            )}
          </div>
        </div>

      </div>

      {/* Vulnerability Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center gap-3">
          <AlertOctagon className="w-6 h-6 text-red-500" />
          <h2 className="text-xl font-bold text-slate-800">At-Risk Workers (Income Drop &gt; 20% MoM)</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm font-medium uppercase tracking-wider">
                <th className="py-4 px-6">Worker Name</th>
                <th className="py-4 px-6">Platform</th>
                <th className="py-4 px-6 text-right">Previous Month</th>
                <th className="py-4 px-6 text-right">Current Month</th>
                <th className="py-4 px-6 text-center">Drop %</th>
                <th className="py-4 px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {vulnerableWorkers.map((worker) => (
                <tr key={worker.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-semibold text-slate-800">{worker.name}</div>
                    <div className="text-xs text-slate-500">{worker.id}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                      {worker.platform}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right font-medium text-slate-600">
                    PKR {worker.previousMonth.toLocaleString()}
                  </td>
                  <td className="py-4 px-6 text-right font-medium text-slate-800">
                    PKR {worker.currentMonth.toLocaleString()}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-bold bg-red-50 text-red-700 border border-red-200 shadow-sm">
                      -{worker.dropPercent}%
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                      Open Case
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
