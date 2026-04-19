"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Scale, FolderOpen, LogOut, LayoutDashboard, Activity } from "lucide-react";

export default function AdvocateLayout({ children }) {
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.clear();
    document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "userRole=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/login";
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center mr-3 shadow-sm">
            <Scale className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-900 text-lg tracking-tight">FairGig Legal</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link 
            href="/advocate/dashboard" 
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              pathname === "/advocate/dashboard" ? "bg-teal-50 text-teal-700" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
          <Link 
            href="/advocate/active-cases" 
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              pathname === "/advocate/active-cases" ? "bg-teal-50 text-teal-700" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <FolderOpen className="w-5 h-5" />
            Active Cases
          </Link>
          <Link 
            href="/advocate/analytics" 
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              pathname === "/advocate/analytics" ? "bg-teal-50 text-teal-700" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Activity className="w-5 h-5" />
            Analytics
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-200">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}