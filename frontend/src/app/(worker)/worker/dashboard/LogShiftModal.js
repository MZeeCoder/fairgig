import { useState } from "react";
import { Plus, CheckCircle, Upload, Loader2, X } from "lucide-react";
import { shiftSchema } from "@/schemas/worker.schema";
import { submitShiftLog } from "@/services/earnings.api";

export default function LogShiftModal({ isOpen, onClose, onShiftAdded }) {
  const [shiftLoading, setShiftLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    platform: "",
    city: "",
    city_zone: "",
    date: "",
    hours: "",
    gross: "",
    deductions: "",
    net: ""
  });

  const [errors, setErrors] = useState({});
  const [screenshotFile, setScreenshotFile] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setScreenshotFile(e.target.files[0]);
      if (errors.file) {
        setErrors({ ...errors, file: null });
      }
    }
  };

  const handleShiftSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    
    // Zod Validation
    const validationResult = shiftSchema.safeParse(formData);

    if (!validationResult.success) {
      const fieldErrors = {};
      validationResult.error.issues.forEach(issue => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    if (!screenshotFile) {
      setErrors({ file: "Please upload a screenshot" });
      return;
    }

    setShiftLoading(true);

    try {
      const data = new FormData();
      data.append("platform", formData.platform);
      data.append("city", formData.city);
      data.append("city_zone", formData.city_zone);
      data.append("date", formData.date);
      data.append("hours_worked", formData.hours);
      data.append("gross_earned", formData.gross);
      data.append("deduction", formData.deductions);
      data.append("net_received", formData.net);
      data.append("screenshot", screenshotFile); 

      // Submit actual shift log
      const result = await submitShiftLog(data);
      
      if (onShiftAdded && result?.data) {
        onShiftAdded(result.data);
      }

      setSubmitted(true);
      setFormData({ platform: "", city: "", city_zone: "", date: "", hours: "", gross: "", deductions: "", net: "" }); 
      setScreenshotFile(null);
      
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 2000);
    } catch (err) {
      console.error("Failed to submit shift", err);
    } finally {
      setShiftLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Plus className="w-5 h-5 text-teal-600" /> Log New Shift
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {submitted ? (
             <div className="py-12 flex flex-col items-center justify-center text-center">
                <CheckCircle className="w-12 h-12 text-teal-500 mb-4" />
                <h3 className="text-lg font-bold text-slate-900 mb-2">Shift Submitted Successfully!</h3>
                <p className="text-sm text-slate-500">Your shift goes into verification automatically.</p>
             </div>
          ) : (
            <form onSubmit={handleShiftSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Platform</label>
                <select 
                  name="platform"
                  value={formData.platform}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all"
                >
                  <option value="">Select Platform</option>
                  <option value="Uber">Uber</option>
                  <option value="Foodpanda">Foodpanda</option>
                  <option value="Bykea">Bykea</option>
                </select>
                {errors.platform && <p className="text-xs text-red-500 mt-1">{errors.platform}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">City</label>
                <input 
                  list="pakistan-cities"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Search or type a city..."
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all"
                />
                <datalist id="pakistan-cities">
                
                </datalist>
                {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">City Zone</label>
                <input 
                  type="text"
                  name="city_zone"
                  value={formData.city_zone}
                  onChange={handleChange}
                  placeholder="E.g. Gulberg, DHA, Bahria Town..."
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all"
                />
                {errors.city_zone && <p className="text-xs text-red-500 mt-1">{errors.city_zone}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Date</label>
                  <input 
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    type="date"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all" 
                  />
                  {errors.date && <p className="text-xs text-red-500 mt-1.5">{errors.date}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Hours Worked</label>
                  <input 
                    name="hours"
                    value={formData.hours}
                    onChange={handleChange}
                    type="number" 
                    step="0.5" 
                    placeholder="6.5"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all" 
                  />
                  {errors.hours && <p className="text-xs text-red-500 mt-1.5">{errors.hours}</p>}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Gross (PKR)</label>
                  <input 
                    name="gross"
                    value={formData.gross}
                    onChange={handleChange}
                    type="number" 
                    placeholder="5200"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all" 
                  />
                  {errors.gross && <p className="text-xs text-red-500 mt-1.5">{errors.gross}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Deductions</label>
                  <input 
                    name="deductions"
                    value={formData.deductions}
                    onChange={handleChange}
                    type="number" 
                    placeholder="350"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all" 
                  />
                  {errors.deductions && <p className="text-xs text-red-500 mt-1.5">{errors.deductions}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Net (PKR)</label>
                  <input 
                    name="net"
                    value={formData.net}
                    onChange={handleChange}
                    type="number" 
                    placeholder="4850"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all" 
                  />
                  {errors.net && <p className="text-xs text-red-500 mt-1.5">{errors.net}</p>}
                </div>
              </div>

              {/* File Upload */}
              <div className="pt-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Screenshot Proof</label>
                <div className="relative">
                  <label className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed ${errors.file ? 'border-red-400 bg-red-50' : 'border-slate-300 hover:border-teal-500 hover:bg-teal-50'} rounded-lg cursor-pointer transition-colors group bg-slate-50`}>
                    {screenshotFile ? (
                      <span className="text-sm font-medium text-teal-700">{screenshotFile.name} selected</span>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-slate-400 group-hover:text-teal-600 mb-2" />
                        <span className="text-xs text-slate-500 group-hover:text-teal-700 font-medium">Click to upload earnings screenshot</span>
                      </>
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  </label>
                  {screenshotFile && (
                    <button
                      type="button"
                      title="Remove image"
                      onClick={(e) => {
                        e.preventDefault();
                        setScreenshotFile(null);
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-white rounded-full text-red-500 hover:bg-red-50 hover:text-red-700 transition border border-slate-200 shadow-sm"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {errors.file && <p className="text-xs text-red-500 mt-1.5">{errors.file}</p>}
              </div>

              <div className="pt-4 flex gap-3 mt-4">
                 <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg transition-colors"
                 >
                    Cancel
                 </button>
                 <button
                    type="submit"
                    disabled={shiftLoading}
                    className="flex-1 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-70 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
                  >
                    {shiftLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {shiftLoading ? "Processing..." : "Submit Shift Log"}
                  </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}