import { useState } from "react";
import { Loader2, ShieldAlert, CheckCircle, AlertCircle, X } from "lucide-react";
import { grievanceSchema } from "@/schemas/worker.schema";
import { createGrievance } from "@/services/grievance.api";

export default function GrievanceModal({ isOpen, onClose, onSuccess }) {
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    platform: "",
    category: "",
    customCategory: "",
    description: "",
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const payloadToValidate = {
      ...formData,
      category: formData.category === "Other" ? formData.customCategory : formData.category,
    };

    const validationResult = grievanceSchema.safeParse(payloadToValidate);

    if (!validationResult.success) {
      const fieldErrors = {};
      validationResult.error.issues.forEach((issue) => {
        const path = issue.path[0];
        if (path === "category" && formData.category === "Other") {
          fieldErrors.customCategory = issue.message;
        } else {
          fieldErrors[path] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    try {
      await createGrievance(validationResult.data);
      setSubmitted(true);
      setFormData({ platform: "", category: "", customCategory: "", description: "" });

      if (onSuccess) onSuccess();

      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 2000);
    } catch (err) {
      console.error(err);
      setErrors({
        form: err?.response?.data?.message || "An error occurred while submitting.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-900">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
            <h2 className="font-bold text-lg">New Report</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {submitted ? (
            <div className="py-8 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Report Submitted Securely</h3>
              <p className="text-sm text-slate-500">
                Your grievance has been sent to the Advocate team for review.
              </p>
            </div>
          ) : (
            <>
              {errors.form && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                  <p className="text-sm text-red-700 font-medium">{errors.form}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Platform
                    </label>
                    <input
                      type="text"
                      name="platform"
                      value={formData.platform}
                      onChange={handleChange}
                      placeholder="e.g., Foodpanda"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all"
                    />
                    {errors.platform && (
                      <p className="text-xs text-red-500 mt-1">{errors.platform}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all cursor-pointer"
                    >
                      <option value="">Select an issue...</option>
                      <option value="Unpaid Earnings">Unpaid Earnings</option>
                      <option value="Unfair Deductions">Unfair Deductions</option>
                      <option value="Sudden Deactivation">Sudden Account Deactivation</option>
                      <option value="Rate Cut">Secret Rate Cut</option>
                      <option value="Other">Other...</option>
                    </select>
                    {errors.category && formData.category !== "Other" && (
                      <p className="text-xs text-red-500 mt-1">{errors.category}</p>
                    )}

                    {formData.category === "Other" && (
                      <div className="mt-3 animate-in fade-in slide-in-from-top-1 duration-200 block">
                        <input
                          type="text"
                          name="customCategory"
                          value={formData.customCategory}
                          onChange={handleChange}
                          placeholder="Please specify category"
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all"
                        />
                        {errors.customCategory && (
                          <p className="text-xs text-red-500 mt-1">{errors.customCategory}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Detailed Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Please explain what happened in detail. Do not include your real name to remain anonymous."
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all resize-none"
                  ></textarea>
                  {errors.description && (
                    <p className="text-xs text-red-500 mt-1">{errors.description}</p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-70 text-white font-medium py-2.5 px-6 rounded-lg transition-colors"
                  >
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isLoading ? "Submitting..." : "Submit Report"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
