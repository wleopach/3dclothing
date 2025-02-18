import axios from 'axios';

// Crear una instancia de axios
const axiosInstance = axios.create({
    //baseURL: 'https://comerciolaroca.com/api',
    baseURL: 'http://127.0.0.1:8000/api',
    //baseURL: process.env.REACT_APP_API_URL,
    timeout: 10_000,

});

// Interceptor para solicitudes
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        let response = error.response;
        if (response && (response.status === 401 || response.status === 403)) {
            window.location = '/';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
