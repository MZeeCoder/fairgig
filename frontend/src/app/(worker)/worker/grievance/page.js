"use client";

import { useState } from "react";
import { Loader2, ShieldAlert, CheckCircle } from "lucide-react";
import { grievanceSchema } from "@/schemas/worker.schema";

export default function GrievancePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    platform: "",
    category: "",
    description: "",
  });
  
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const validationResult = grievanceSchema.safeParse(formData);

    if (!validationResult.success) {
      const fieldErrors = {};
      validationResult.error.issues.forEach(issue => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    try {
      console.log("Submitting Grievance:", validationResult.data);
      // Fake API call
      await new Promise(r => setTimeout(r, 1500));
      setSubmitted(true);
      setFormData({ platform: "", category: "", description: "" });
      setTimeout(() => setSubmitted(false), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">File a Grievance</h1>
        <p className="text-sm text-slate-500 mt-1">Report unfair practices, missing pay, or account issues. Advocates will review this.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
          <ShieldAlert className="w-5 h-5 text-amber-500" />
          <h2 className="text-base font-bold text-slate-900">New Report</h2>
        </div>

        {submitted && (
          <div className="mb-6 p-4 bg-teal-50 border border-teal-200 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-teal-600" />
            <p className="text-sm text-teal-700 font-medium">Your grievance has been submitted securely to the Advocate team.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Platform</label>
              <input 
                type="text" 
                name="platform"
                value={formData.platform}
                onChange={handleChange}
                placeholder="e.g., Foodpanda" 
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all"
              />
              {errors.platform && <p className="text-xs text-red-500 mt-1">{errors.platform}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
              <select 
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all cursor-pointer"
              >
                <option value="">Select an issue...</option>
                <option value="Unpaid Earnings">Unpaid Earnings</option>
                <option value="Unfair Deductions">Unfair Deductions</option>
                <option value="Sudden Deactivation">Sudden Account Deactivation</option>
                <option value="Rate Cut">Secret Rate Cut</option>
                <option value="Other">Other</option>
              </select>
              {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Detailed Description</label>
            <textarea 
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4" 
              placeholder="Please explain what happened in detail. Do not include your real name to remain anonymous."
              className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all resize-none"
            ></textarea>
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-70 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? "Submitting..." : "Submit Report"}
          </button>
        </form>
      </div>

      {/* Past Reports Table */}
      <h3 className="text-sm font-bold text-slate-900 mb-3">Your Previous Reports</h3>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Platform</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr className="hover:bg-slate-50">
              <td className="px-6 py-4 text-sm text-slate-600">2025-07-01</td>
              <td className="px-6 py-4 text-sm font-medium text-slate-900">Uber</td>
              <td className="px-6 py-4 text-sm text-slate-600">Unfair Deductions</td>
              <td className="px-6 py-4"><span className="text-xs font-medium bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-200">Under Review</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  );
}