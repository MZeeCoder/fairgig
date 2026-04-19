import axiosInstance from "../lib/axiosInstance";
import useAuthStore from "../store/authStore";

export const fetchGrievances = async () => {
  try {
    const response = await axiosInstance.get("/advocate/grievances/open");
    return response.data;
  } catch (error) {
    console.error("Error fetching grievances:", error);
    return { success: false, data: [] };
  }
};

export const getComplaintById = async (id) => {
  try {
    const response = await axiosInstance.get(`/advocate/grievances/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching complaint:", error);
    return { success: false, data: null };
  }
};

export const resolveGrievance = async (id, status, notes) => {
  try {
    const user = useAuthStore.getState().user;
    const advocateId = user?._id || user?.id;
    const response = await axiosInstance.patch(`/advocate/grievances/${id}/escalate/${advocateId}`, { status, notes });
    return response.data;
  } catch (error) {
    console.error("Error resolving grievance:", error);
    return { success: false, message: "Error resolving grievance" };
  }
};

export const fetchLiveAnalytics = async () => {
  try {
    const response = await axiosInstance.get("/advocate/analytics");
    return response.data;
  } catch (error) {
    console.error("Error fetching live analytics:", error);
    return { success: false, data: null };
  }
};

export const fetchCommissionTrend = async (platform = "Uber") => {
  try {
    const response = await axiosInstance.get(`/advocate/analytics/commission-trend?platform=${platform}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching commission trend:", error);
    return { success: false, data: [] };
  }
};

export const fetchVolatility = async (city = "Lahore") => {
  try {
    const response = await axiosInstance.get(`/advocate/volatility?city=${city}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching volatility:", error);
    return { success: false, data: [] };
  }
};
