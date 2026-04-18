import axiosInstance from "../lib/axiosInstance";

export const createGrievance = async (data) => {
  const response = await axiosInstance.post("/grievances", data);
  return response.data;
};

export const getUserGrievances = async (userId) => {
  const response = await axiosInstance.get(`/grievances/user/${userId}`);
  return response.data;
};
