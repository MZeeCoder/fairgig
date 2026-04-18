import api from '../lib/axiosInstance';

export const loginUser = async (credentials) => {
  try {
    const res = await api.post('/users/login', credentials);
    return res.data;
  } catch (error) {
    console.error("Login Error:", error?.response?.data || error.message);
    // throw it back to the component so we can show the error state in the UI
    throw error; 
  }
};

export const registerUser = async (userData, type) => {
  try {
    // current backend exposes one signup endpoint for both worker and staff payloads
    const endpoint = '/users/signup';
    
    const res = await api.post(endpoint, userData);
    return res.data;
  } catch (error) {
    console.error("Register Error:", error?.response?.data || error.message);
    throw error;
  }
};