import fastApi from '../lib/fastapiInstance';

export const submitShiftLog = async (formData) => {
  try {
    const res = await fastApi.post('/api/v1/earnings/', formData);
    return res.data;
  } catch (error) {
    console.error("Shift Log Error:", error?.response?.data || error.message);
    throw error;
  }
};

export const fetchPlatforms = async () => {
  try {
    const res = await fastApi.get('/api/v1/earnings/analytics/platforms');
    return res.data;
  } catch (error) {
    console.error("Fetch Platforms Error:", error?.response?.data || error.message);
    throw error;
  }
};

export const fetchHistory = async () => {
  try {
    const res = await fastApi.get('/api/v1/earnings/history');
    return res.data;
  } catch (error) {
    console.error("Fetch History Error:", error?.response?.data || error.message);
    throw error;
  }
};