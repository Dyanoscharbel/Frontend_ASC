export const API_URL = `${import.meta.env.VITE_API_URL}/api`;

// Debug: afficher l'URL de l'API
console.log('API URL:', API_URL);

// Exemple d'utilisation avec axios
import axios from 'axios';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    // Ajouter CORS et credentials
    withCredentials: true,
}); 

// Intercepteur pour le débogage
api.interceptors.request.use(request => {
    console.log('Starting Request:', request);
    return request;
});

api.interceptors.response.use(
    response => {
        console.log('Response:', response);
        return response;
    },
    error => {
        console.error('API Error:', error.response || error);
        return Promise.reject(error);
    }
); 
