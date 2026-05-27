import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    console.log('Token encontrado:', token ? '✅ Sí' : '❌ No');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Error en petición:', error.response?.status, error.response?.data);
    
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      console.log('Error 401 - Redirigiendo a login');
      sessionStorage.removeItem('token');  // ✅ Cambiado de localStorage a sessionStorage
      sessionStorage.removeItem('user');   // ✅ Cambiado de localStorage a sessionStorage
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;