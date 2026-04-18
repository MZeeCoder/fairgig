import fastApi from "../lib/fastapiInstance";

export const submitShiftLog = async (formData) => {
  try {
    const res = await fastApi.post("/api/v1/earnings/", formData);
    return res.data;
  } catch (error) {
    console.error("Shift Log Error:", error?.response?.data || error.message);
    throw error;
  }
};

export const fetchPlatforms = async () => {
  try {
    const res = await fastApi.get("/api/v1/earnings/analytics/platforms");
    return res.data;
  } catch (error) {
    console.error(
      "Fetch Platforms Error:",
      error?.response?.data || error.message,
    );
    throw error;
  }
};
export const fetchWorkerDashboard = async (params = {}) => {
  try {
    const res = await fastApi.get(
      "/api/v1/earnings/analytics/worker-dashboard",
      { params },
    );
    return res.data;
  } catch (error) {
    console.error(
      "Fetch Worker Dashboard Error:",
      error?.response?.data || error.message,
    );
    throw error;
  }
};

export const downloadWorkerDashboardPdf = async (params = {}) => {
  try {
    const res = await fastApi.get(
      "/api/v1/earnings/analytics/worker-dashboard/pdf",
      {
        params,
        responseType: "blob",
      },
    );
    return res;
  } catch (error) {
    console.error(
      "Download Worker Dashboard PDF Error:",
      error?.response?.data || error.message,
    );
    throw error;
  }
};

export const fetchHistory = async () => {
  try {
    const res = await fastApi.get("/api/v1/earnings/history");
    return res.data;
  } catch (error) {
    console.error(
      "Fetch History Error:",
      error?.response?.data || error.message,
    );
    throw error;
  }
};
