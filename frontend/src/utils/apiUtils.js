// src/utils/apiUtils.js

/**
 * Realiza una petición fetch segura que siempre retorna un array
 * @param {string} url - URL de la API
 * @param {object} options - Opciones de fetch (headers, method, etc.)
 * @param {array} defaultValue - Valor por defecto si falla
 * @returns {Promise<array>} - Siempre retorna un array
 */
export async function fetchSafeArray(url, options = {}, defaultValue = []) {
    try {
        const response = await fetch(url, options);
        
        // Si no es exitoso, retornar defaultValue
        if (!response.ok) {
            console.error(`Error ${response.status} en ${url}`);
            return defaultValue;
        }
        
        const data = await response.json();
        
        // Si la respuesta es un array, retornarlo
        if (Array.isArray(data)) {
            return data;
        }
        
        // Si es un objeto con una propiedad que es array
        if (data && typeof data === 'object') {
            // Intentar encontrar alguna propiedad que sea array
            for (const key in data) {
                if (Array.isArray(data[key])) {
                    console.warn(`Usando data.${key} como array`);
                    return data[key];
                }
            }
        }
        
        console.warn(`La respuesta no es un array:`, data);
        return defaultValue;
        
    } catch (error) {
        console.error(`Error en fetch a ${url}:`, error);
        return defaultValue;
    }
}

/**
 * Verifica si el token es válido
 * @returns {boolean}
 */
export function isTokenValid() {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) return false;
    
    try {
        // Decodificar token JWT para verificar expiración
        const payload = JSON.parse(atob(token.split('.')[1]));
        const exp = payload.exp * 1000; // convertir a milisegundos
        return Date.now() < exp;
    } catch (error) {
        return true; // Si no se puede decodificar, asumir que es válido
    }
}

/**
 * Obtiene el token de donde esté guardado
 * @returns {string|null}
 */
export function getToken() {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
}