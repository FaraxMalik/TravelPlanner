// API Service for TravelPlanner
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  verifyToken: () => api.get('/auth/verify'),
};

// User API calls
export const userAPI = {
  getProfile: () => api.get('/auth/user/me'),
  updateProfile: (userData) => api.put('/auth/user/profile', userData),
  updatePreferences: (preferences) => api.put('/auth/user/preferences', preferences),
  getPersonality: () => api.get('/auth/user/personality'),
};

// Preferences API calls
export const preferencesAPI = {
  submitPreferences: (preferences) => api.post('/preferences/submit', preferences),
  getQuestions: () => api.get('/preferences/questions'),
  analyzePersonality: (preferences) => api.post('/preferences/analyze', preferences),
};

// Travel API calls
export const travelAPI = {
  generateItinerary: (tripData) => api.post('/travel/generate', tripData),
  getItineraries: () => api.get('/travel/itineraries'),
  saveItinerary: (itinerary) => api.post('/travel/save', itinerary),
  deleteItinerary: (id) => api.delete(`/travel/itinerary/${id}`),
};

// AI API calls
export const aiAPI = {
  generatePersonalizedPlan: (data) => api.post('/ai/personalized-plan', data),
  getRecommendations: (preferences) => api.post('/ai/recommendations', preferences),
  generateItinerary: (tripData) => api.post('/ai/generate-itinerary', tripData),
  analyzePersonality: (preferences) => api.post('/ai/analyze-personality', preferences),
  getWeatherForecast: (destination, dates) => api.post('/ai/weather-forecast', { destination, dates }),
};

// PDF API calls
export const pdfAPI = {
  generateItineraryPDF: (itineraryData) => api.post('/ai/generate-pdf', itineraryData, {
    responseType: 'blob',
    headers: {
      'Accept': 'application/pdf',
    },
  }),
};

export default api;
