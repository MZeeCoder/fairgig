import React from "react";
import { X, Download, TrendingUp, DollarSign, Clock, MapPin } from "lucide-react";

export default function AnalyticsModal({
  isOpen,
  onClose,
  data,
  platform,
  startDate,
  endDate,
  onDownloadPdf,
  isDownloadingPdf = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Earnings Analytics</h2>
            <p className="text-sm text-slate-500 mt-1">
              {platform ? `${platform} • ` : "All Platforms • "}
              {startDate || "Beginning"} to {endDate || "Today"}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        
        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-slate-50/20" id="analytics-pdf-content">
          {!data ? (
            <p className="text-slate-500 text-center py-10">No dashboard data available.</p>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-medium text-slate-500">Verified Net</p>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">
                    PKR {data.summary?.total_verified_net?.toLocaleString() || 0}
                  </p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <Clock className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-medium text-slate-500">Current Hourly Rate</p>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">
                    PKR {data.summary?.current_hourly_rate?.toLocaleString() || 0}/hr
                  </p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm md:col-span-2">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-medium text-slate-500">City Benchmark ({data.benchmarks?.city || "N/A"})</p>
                  </div>
                  <div className="flex items-end justify-between">
                    <p className="text-2xl font-bold text-slate-900">
                      PKR {data.benchmarks?.city_median?.toLocaleString() || 0}/hr
                    </p>
                    <span className={`text-sm font-medium px-2.5 py-1 rounded-full ${
                      (data.benchmarks?.status || '').includes('Above') ? 'bg-teal-50 text-teal-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {data.benchmarks?.status || "Unknown"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Platform Breakdown */}
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-slate-400" />
                    Platform Breakdown
                  </h3>
                  {data.platform_breakdown?.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 text-sm text-slate-500">
                            <th className="pb-3 font-medium">Platform</th>
                            <th className="pb-3 font-medium text-right">Avg Comm. rate</th>
                            <th className="pb-3 font-medium text-right">Earned</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {data.platform_breakdown.map((item, idx) => (
                            <tr key={idx}>
                              <td className="py-3 font-medium text-slate-800">{item.platform}</td>
                              <td className="py-3 text-right text-slate-600">{item.avg_commission_rate}%</td>
                              <td className="py-3 text-right font-semibold text-slate-900">
                                PKR {item.total_earned?.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm">No platform breakdown data available.</p>
                  )}
                </div>

                {/* Earning Trend */}
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Earning Trend</h3>
                  {data.earning_trend?.length > 0 ? (
                    <div className="space-y-4">
                      {data.earning_trend.map((trend, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                          <div>
                            <p className="font-medium text-slate-800">{trend.period}</p>
                            <p className="text-xs text-slate-500">{trend.effective_hourly_rate} PKR/hr</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-slate-900 text-lg">PKR {trend.net?.toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm">No earning trend data available.</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-white">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
          <button 
            onClick={onDownloadPdf}
            disabled={isDownloadingPdf}
            className="px-5 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Download className="w-4 h-4" />
            {isDownloadingPdf ? "Downloading..." : "Download PDF"}
          </button>
        </div>
      </div>
    </div>
  );
}
