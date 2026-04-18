import api from '../lib/axiosInstance'; // Your Node.js Axios instance

export const fetchPendingShifts = async () => {
  try {
    const res = await api.get('/verifier/shifts/pending');
    return res.data;
  } catch (error) {
    console.error("Error fetching shifts:", error);
    throw error;
  }
};

export const fetchHistoryShifts = async () => {
  try {
    const res = await api.get('/verifier/shifts/history');
    return res.data;
  } catch (error) {
    console.error("Error fetching history shifts:", error);
    throw error;
  }
};

export const updateShiftStatus = async (shiftId, newStatus) => {
  try {
    const res = await api.patch(`/verifier/shifts/${shiftId}/status`, { status: newStatus });
    return res.data;
  } catch (error) {
    console.error("Error updating status:", error);
    throw error;
  }
};