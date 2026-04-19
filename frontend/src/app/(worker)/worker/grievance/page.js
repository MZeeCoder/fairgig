"use client";

import { useState, useEffect } from "react";
import { Loader2, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { getUserGrievances } from "@/services/grievance.api";
import GrievanceModal from "./GrievanceModal";

export default function GrievancePage() {
  const [isFetching, setIsFetching] = useState(true);
  const [grievances, setGrievances] = useState([]);
  const [userId, setUserId] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const [isModSalOpen, setIsModalOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(grievances.length / itemsPerPage);

  const paginatedGrievances = grievances.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const payloadStr = token.split(".")[1];
        if (payloadStr) {
          const payload = JSON.parse(atob(payloadStr));
          if (payload && payload.userId) {
            setUserId(payload.userId);
            fetchGrievances(payload.userId);
          }
        }
      } catch (err) {
        console.error("Error decoding token:", err);
      }
    }
  }, []);

  const fetchGrievances = async (id) => {
    try {
      setIsFetching(true);
      const data = await getUserGrievances(id);
      if (data?.data) {
        // Assuming data is wrapped in ApiResponse
        setGrievances(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch grievances", err);
      setFetchError("Could not load your past reports.");
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            File a Grievance
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Report unfair practices, missing pay, or account issues. Advocates
            will review this.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 px-5 rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          New Report
        </button>
      </div>

      <GrievanceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          if (userId) fetchGrievances(userId);
        }}
      />

      {/* Past Reports Table */}
      <h3 className="text-sm font-bold text-slate-900 mb-3">
        Your Previous Reports
      </h3>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                Platform
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isFetching ? (
              [...Array(3)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4">
                    <div className="h-4 bg-slate-200 rounded w-24"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-slate-200 rounded w-20"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-slate-200 rounded w-32"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-slate-200 rounded w-48"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-6 bg-slate-200 rounded-full w-24"></div>
                  </td>
                </tr>
              ))
            ) : fetchError ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-4 text-center text-sm text-red-500"
                >
                  {fetchError}
                </td>
              </tr>
            ) : grievances.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-8 text-center text-sm text-slate-500"
                >
                  No grievances found.
                </td>
              </tr>
            ) : (
              paginatedGrievances.map((g) => (
                <tr key={g._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm text-slate-600 truncate max-w-[100px]">
                    {new Date(g.createdAt || Date.now()).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900 truncate max-w-[120px]">
                    {g.platform}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 truncate max-w-[150px]">
                    {g.category}
                  </td>
                  <td
                    className="px-6 py-4 text-sm text-slate-600 truncate max-w-[200px]"
                    title={g.description}
                  >
                    {g.description || "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-200 whitespace-nowrap">
                      {g.status || "Under Review"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 bg-white rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          <span className="text-sm font-medium text-slate-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 bg-white rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </main>
  );
}
