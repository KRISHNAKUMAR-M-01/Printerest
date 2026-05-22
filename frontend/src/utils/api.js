const BASE_URL = 'http://localhost:5001/api';

const getHeaders = (isMultipart = false) => {
  const headers = {};
  
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

const handleResponse = async (response) => {
  if (!response.ok) {
    let errorMessage = 'An error occurred';
    try {
      const data = await response.json();
      errorMessage = data.message || errorMessage;
    } catch (e) {
      // response wasn't json or failed to parse
    }
    
    // Auto logout on 401 Unauthorized
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login if on protected page (could be handled in context, but reset is safe)
    }
    
    throw new Error(errorMessage);
  }
  
  return response.json();
};

export const api = {
  get: async (endpoint) => {
    const config = {
      method: 'GET',
      headers: getHeaders()
    };
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    return handleResponse(response);
  },

  post: async (endpoint, data, isMultipart = false) => {
    const config = {
      method: 'POST',
      headers: getHeaders(isMultipart),
      body: isMultipart ? data : JSON.stringify(data)
    };
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    return handleResponse(response);
  },

  put: async (endpoint, data, isMultipart = false) => {
    const config = {
      method: 'PUT',
      headers: getHeaders(isMultipart),
      body: isMultipart ? data : JSON.stringify(data)
    };
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    return handleResponse(response);
  },

  delete: async (endpoint) => {
    const config = {
      method: 'DELETE',
      headers: getHeaders()
    };
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    return handleResponse(response);
  },
  
  // Expose the raw upload capability specifically
  upload: async (endpoint, formData) => {
    return api.post(endpoint, formData, true);
  }
};
export default api;
