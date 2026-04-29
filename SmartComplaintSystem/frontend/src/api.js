// Centralized API base URL - reads from environment variable for deployment
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default API_BASE;
