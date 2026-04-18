"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { deleteAuthCookies } from "@/app/actions";
import { LayoutDashboard, History, MessageSquareWarning, LogOut, Briefcase } from "lucide-react";

export default function WorkerLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  const handleLogout = async () => {
    localStorage.clear();
    await deleteAuthCookies();
    window.location.href = "/login";
  };

  return (
    <div className="flex h-screen bg-slate-50">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center mr-3">
            <Briefcase className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-900 text-lg tracking-tight">FairGig</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link 
            href="/worker/dashboard" 
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              pathname === "/worker" ? "bg-teal-50 text-teal-700" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard & Logs
          </Link>
          
          <Link 
            href="/worker/history" 
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              pathname === "/worker/history" ? "bg-teal-50 text-teal-700" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <History className="w-5 h-5" />
            Earnings History
          </Link>
          
          <Link 
            href="/worker/grievance" 
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              pathname === "/worker/grievance" ? "bg-teal-50 text-teal-700" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <MessageSquareWarning className="w-5 h-5" />
            File a Grievance
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-200">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area (Scrollable) */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>

    </div>
  );
}