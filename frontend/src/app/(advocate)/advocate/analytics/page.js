"use client";

import React, { useEffect, useState } from "react";

import {  AlertOctagon, Activity } from "lucide-react";
import { fetchAnalytics } from "../../../../services/advocate.api";


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
      const response = await fetchAnalytics();
      if (response?.success && response?.data) {
        setData(response.data);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const { topComplaints: topComplaintsData, incomeByCity: incomeByCityData, commissionTrend: commissionTrendData, vulnerableWorkers } = data;

 

  const platformsSet = new Set();
  commissionTrendData.forEach(month => {
    Object.keys(month).forEach(key => {
      if (key !== 'month') platformsSet.add(key);
    });
  });
  const platforms = Array.from(platformsSet);

  return (
    <main className="p-8 max-w-7xl mx-auto h-full overflow-y-auto bg-slate-50">
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Activity className="w-8 h-8 text-indigo-600" />
          System Analytics 
        </h1>
        <p className="text-slate-500 mt-2">
          Aggregate platform metrics and at-risk worker flags.
        </p>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
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
              {loading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={`skeleton-${i}`} className="animate-pulse">
                    <td className="py-4 px-6">
                      <div className="h-4 bg-slate-200 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-slate-200 rounded w-20"></div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-5 bg-slate-200 rounded-full w-20 bg-slate-200"></div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-4 bg-slate-200 rounded w-16 ml-auto"></div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-4 bg-slate-200 rounded w-16 ml-auto"></div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-6 bg-slate-200 rounded-md w-12 mx-auto"></div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-4 bg-slate-200 rounded w-16 mx-auto"></div>
                    </td>
                  </tr>
                ))
              ) : vulnerableWorkers.map((worker) => (
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
