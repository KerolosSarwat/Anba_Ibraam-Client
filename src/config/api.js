// API Configuration
// This file centralizes the API base URL for all requests

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://anbaibraam-server-production.up.railway.app/';

// Ensure no trailing slash
export const API_URL = API_BASE_URL.replace(/\/$/, '');

// Helper function to build API endpoint URLs
export const buildApiUrl = (endpoint) => {
    // Remove leading slash if present
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${API_URL}/${cleanEndpoint}`;
};

export default API_URL;
