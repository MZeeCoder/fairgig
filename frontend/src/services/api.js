import axiosInstance from '../lib/axiosInstance';
import useAuthStore from '../store/authStore';

// --- Auth Service ---
export const loginUser = async (credentials) => {
  try {
    const response = await axiosInstance.post('/auth/login', credentials);
    // The response should contain user, accessToken, and refreshToken
    const { user, accessToken, refreshToken } = response.data;
    
    // Use the login action from the store
    useAuthStore.getState().login(user, accessToken, refreshToken);
    
    return response.data;
  } catch (error) {
    console.error("Login failed:", error.response?.data || error.message);
    throw error;
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await axiosInstance.post('/auth/register', userData);
    // Assuming registration also returns tokens and user data
    const { user, accessToken, refreshToken } = response.data;
    useAuthStore.getState().login(user, accessToken, refreshToken);
    return response.data;
  } catch (error) {
    console.error("Registration failed:", error.response?.data || error.message);
    throw error;
  }
};

// --- Worker Service ---
export const submitShift = async (shiftData) => {
  try {
    const response = await axiosInstance.post('/worker/shifts', shiftData);
    return response.data;
  } catch (error) {
    console.error("Shift submission failed:", error.response?.data || error.message);
    throw error;
  }
};

// --- Example Component Usage ---

/*
import { useState } from 'react';
import { submitShift } from '../services/api';

function ShiftSubmissionForm() {
  const [shiftDetails, setShiftDetails] = useState({ hours: 8, location: 'Site A' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const result = await submitShift(shiftDetails);
      console.log('Shift submitted successfully!', result);
      // Handle success (e.g., show a success message, clear form)
    } catch (err) {
      setError('Failed to submit shift. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // ... return your form JSX
}
*/
