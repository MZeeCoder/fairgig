"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { ClipboardCheck, History, LogOut, ShieldCheck } from "lucide-react";

export default function VerifierLayout({ children }) {
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.clear();
    document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "userRole=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    toast.success("Logged out successfully");
    window.location.href = "/login";
  };

  return (
    <div className="flex h-screen bg-slate-50">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center mr-3 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-900 text-lg tracking-tight">FairGig Staff</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link 
            href="/verifier" 
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              pathname === "/verifier" ? "bg-teal-50 text-teal-700" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <ClipboardCheck className="w-5 h-5" />
            Verification Queue
          </Link>
          
          <Link 
            href="/verifier/history" 
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              pathname === "/verifier/history" ? "bg-teal-50 text-teal-700" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <History className="w-5 h-5" />
            Reviewed Logs
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

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <h2 className="text-sm font-bold text-slate-900">Verifier Workspace</h2>
         
        </header>
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}