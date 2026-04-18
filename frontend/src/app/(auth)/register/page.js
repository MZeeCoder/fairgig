"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Briefcase, User, Mail, Lock, MapPin, Layers, Shield, Phone, FileUp } from "lucide-react";
import { authSchemas } from "../../../schemas/auth.schema";
import { registerUser } from "../../../services/auth.api";
import useAuthStore from "../../../store/authStore";

export default function RegisterPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const [activeTab, setActiveTab] = useState("worker");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    city: "",
    platforms: "",
    role: "",
    documents: [],
  });

  const handleChange = (e) => {
    const { name, value, files, type } = e.target;

    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));

    if (type === "file") {
      setFormData({ ...formData, [name]: Array.from(files || []) });
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError("");
    setFieldErrors({});
    if (tab === "worker") {
      setFormData((prev) => ({ ...prev, role: "", documents: [] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const schema = activeTab === "worker"
      ? authSchemas.register.worker
      : authSchemas.register.staff;

    const zodValidation = schema.safeParse(formData);

    if (!zodValidation.success) {
      const flattenedErrors = zodValidation.error.flatten().fieldErrors;
      setFieldErrors(flattenedErrors);
      setError(zodValidation.error.issues[0]?.message || "Please make sure everything is correct.");
      return;
    }

    if (activeTab === "staff" && formData.documents.length === 0) {
      setFieldErrors((prev) => ({ ...prev, documents: ["Please upload at least one verification document."] }));
      setError("Document is required for staff registration.");
      return;
    }

    setIsLoading(true);

    try {
      const commonPayload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        city: formData.city,
      };

      let response;
      if (activeTab === "worker") {
        const payload = {
          ...commonPayload,
          role: "worker",
          platforms: formData.platforms
            .split(",")
            .map((platform) => platform.trim())
            .filter(Boolean),
        };
        response = await registerUser(payload, activeTab);
      } else {
        const payload = new FormData();
        payload.append("name", commonPayload.name);
        payload.append("email", commonPayload.email);
        payload.append("password", commonPayload.password);
        payload.append("phone", commonPayload.phone);
        payload.append("city", commonPayload.city);
        payload.append("role", formData.role);

        formData.documents.forEach((file) => {
          payload.append("verificationDocuments", file);
        });

        response = await registerUser(payload, activeTab);
      }

      const { user, accessToken, refreshToken } = response?.data || {};

      if (user && accessToken) {
        login(user, accessToken, refreshToken);
        const roleRouteMap = {
          worker: "/worker",
          verifier: "/verifier",
          advocate: "/advocate",
        };
        router.push(roleRouteMap[user.role] || "/unauthorized");
      }

      setIsLoading(false);
      setError("");
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-teal-600 rounded-2xl mb-4 shadow-md">
            <Briefcase className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Join FairGig</h1>
          <p className="text-slate-500 text-sm mt-1">Create your account to get started</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h2 className="text-xl text-center font-semibold text-slate-900 mb-1">Sign Up</h2>
          <p className="text-slate-500 text-center text-sm">Choose your account type below.</p>

          <div className="flex gap-2 mt-5 bg-slate-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => handleTabChange("worker")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                activeTab === "worker"
                  ? "bg-white text-teal-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Layers className="w-4 h-4" />
              Worker Sign Up
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("staff")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                activeTab === "staff"
                  ? "bg-white text-teal-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Shield className="w-4 h-4" />
              Staff Sign Up
            </button>
          </div>

          <div className="mt-3 px-1 mb-5">
            {activeTab === "worker" ? (
              <p className="text-xs text-slate-500">
                For gig workers on platforms like Uber, Foodpanda, Bykea, and others.
              </p>
            ) : (
              <p className="text-xs text-slate-500">
                For NGO staff, verifiers, and policy advocates managing worker data.
              </p>
            )}
          </div>

  

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ali Hassan"
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                {fieldErrors.name?.[0] && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.name[0]}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="ali@example.com"
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                {fieldErrors.email?.[0] && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.email[0]}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  name="phone"
                  maxLength={11}
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="0300XXXXXXX"
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>
              {fieldErrors.phone?.[0] && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.phone[0]}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                {fieldErrors.password?.[0] && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.password[0]}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                {fieldErrors.confirmPassword?.[0] && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.confirmPassword[0]}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Lahore, Karachi, Islamabad..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>
              {fieldErrors.city?.[0] && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.city[0]}</p>
              )}
            </div>

            {activeTab === "worker" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Platforms (comma-separated)</label>
                <div className="relative">
                  <Layers className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    name="platforms"
                    value={formData.platforms}
                    onChange={handleChange}
                    placeholder="Uber, Foodpanda, Bykea, Careem..."
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                {fieldErrors.platforms?.[0] && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.platforms[0]}</p>
                )}
              </div>
            )}

            {activeTab === "staff" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Staff Role</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 appearance-none"
                  >
                    <option value="">Select a role...</option>
                    <option value="verifier">Verifier</option>
                    <option value="advocate">Advocate</option>
                  </select>
                </div>
                {fieldErrors.role?.[0] && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.role[0]}</p>
                )}

                <label className="block text-sm font-medium text-slate-700 mb-1 mt-4">Document</label>
                <div className="relative">
                  <FileUp className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="file"
                    name="documents"
                    multiple
                    onChange={handleChange}
                    accept="image/*,.pdf,.doc,.docx"
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                {fieldErrors.documents?.[0] && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.documents[0]}</p>
                )}
              </div>
            )}

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
                `Create ${activeTab === "worker" ? "Worker" : "Staff"} Account`
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-teal-600 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
