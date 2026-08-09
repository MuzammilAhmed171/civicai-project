import axios from 'axios';

const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:5000/api';
    }
    if (host.includes('vercel.app')) {
      return `${window.location.origin}/api`;
    }
  }
  return 'https://civicai-project.vercel.app/api';
};

const API_URL = getBaseUrl();
const api = axios.create({ baseURL: API_URL, headers: { 'Content-Type': 'application/json' } });

export default api;
