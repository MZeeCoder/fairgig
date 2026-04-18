"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Briefcase, Mail, Lock } from "lucide-react";
import { authSchemas } from "../../../schemas/auth.schema";
import { loginUser } from "../../../services/auth.api";
import useAuthStore from "../../../store/authStore";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const zodValidation = authSchemas.login.safeParse({ email, password });

    if (!zodValidation.success) {
      const validationError = zodValidation.error.flatten().fieldErrors;
      setFieldErrors(validationError);
      setError(zodValidation.error.issues[0]?.message || "Please make sure everything is correct.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await loginUser({ email, password });
      
      const { user, accessToken, refreshToken } = response?.data || {};

      if (!user || !accessToken) {
        throw new Error("Invalid login response from server.");
      }

      login(user, accessToken, refreshToken);

      const roleRouteMap = {
        worker: "/worker",
        verifier: "/verifier",
        advocate: "/advocate",
      };

      router.push(roleRouteMap[user.role] || "/unauthorized");
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-teal-600 rounded-2xl mb-4 shadow-md">
            <Briefcase className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">FairGig</h1>
          <p className="text-slate-500 text-sm mt-1">Protecting gig worker rights</p>
        </div>

        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900">Welcome back</h2>
            <p className="text-slate-500 text-sm mt-1">Sign in to your account to continue</p>
          </div>

        

          <form onSubmit={handleLogin} className="space-y-4">
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>
              {fieldErrors.email?.[0] && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.email[0]}</p>
              )}
            </div>

            
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-slate-700">Password</label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>
              {fieldErrors.password?.[0] && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.password[0]}</p>
              )}
            </div>

            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 rounded-lg disabled:opacity-75 transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          
          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{" "}
            <Link href="/register" className="text-teal-600 hover:underline font-medium">
              Create one
            </Link>
          </p>
        </div>
        
      </div>
    </div>
  );
}
