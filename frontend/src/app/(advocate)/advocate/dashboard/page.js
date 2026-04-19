"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FolderOpen, TrendingUp, MapPin, AlertOctagon } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from "recharts";
import { fetchCommissionTrend, fetchVolatility, fetchGrievances, fetchAnalytics } from "@/services/advocate.api";



export default function AdvocateDashboardPage() {
  const [trendData, setTrendData] = useState([]);
  const [cityData, setCityData] = useState([]);
  const [activeCases, setActiveCases] = useState(0);
  const [topComplaintsData, setTopComplaintsData] = useState([]);

  useEffect(() => {
    loadAnalytics();
    loadCases();
  }, []);

  const loadAnalytics = async () => {
    const trendRes = await fetchCommissionTrend("Uber");
    if (trendRes?.success && trendRes.data?.trend) {
      setTrendData(trendRes.data.trend.map(t => ({
        name: t.date.slice(5),
        commission: t.total_gross_earned || 0
      })));
    }
    const response = await fetchVolatility("Lahore");
    if (response?.success && response.data?.volatility) {
      setCityData(response.data.volatility.map(v => ({
        name: v.zone || "Unknown",
        commission: v.median_net_received || 0
      })));
    }
    const analyticsResponse = await fetchAnalytics();
    if (analyticsResponse?.success && analyticsResponse.data?.topComplaints) {
      setTopComplaintsData(analyticsResponse.data.topComplaints);
    }
  };

  const loadCases = async () => {
    const res = await fetchGrievances();
    if (res?.success) {
      setActiveCases(res.data?.length || 0);
    }
  };

  return (
    <div className="p-8 bg-slate-50 h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Overview of your cases and activities</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Link href="/advocate/active-cases" className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-300 transition-all flex items-center gap-4 cursor-pointer">
            <div className="w-12 h-12 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
              <FolderOpen className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Cases</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{activeCases}</h3>
            </div>
          </Link>
       
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full mt-4">
          {/* Chart 1: Platform Analytics */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="font-bold text-slate-900">Commission Trend for Uber (30 Days)</h3>
            </div>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={trendData} margin={{ top: 20, right: 0, left: 10, bottom: 0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} dx={-10} />
                  <Tooltip cursor={{ fill: 'transparent' }} content={<CustomTooltip />} />
                  <Bar dataKey="commission" radius={[4, 4, 0, 0]}>
                    {trendData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#4f46e5' : '#818cf8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: City Analytics */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-teal-50 rounded-lg">
                <MapPin className="w-5 h-5 text-teal-600" />
              </div>
              <h3 className="font-bold text-slate-900">Median Earnings by Zone (Lahore)</h3>
            </div>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={cityData} margin={{ top: 20, right: 0, left: 10, bottom: 0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} dx={-10} />
                  <Tooltip cursor={{ fill: 'transparent' }} content={<CustomTooltip />} />
                  <Bar dataKey="commission" radius={[4, 4, 0, 0]}>
                    {cityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#0d9488' : '#5eead4'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Bar Chart (Horizontal) */}
        <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
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
    </div>
  );
}
