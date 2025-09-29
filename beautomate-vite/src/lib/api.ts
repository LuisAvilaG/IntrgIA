import axios, { AxiosResponse } from 'axios';

/**
 * Gets the base URL from local storage and throws an error if not found.
 * @returns The base n8n URL.
 */
const getBaseUrl = (): string => {
    const n8nUrl = localStorage.getItem('n8nUrl');
    if (!n8nUrl) {
      throw new Error('La URL de n8n no está configurada.');
    }
    return n8nUrl;
}

/**
 * Performs a GET request, trying the test URL first and falling back to the production URL.
 * @param endpoint The API endpoint to hit (e.g., '/clients').
 * @returns The axios response.
 */
export const apiGet = async (endpoint: string): Promise<AxiosResponse<any>> => {
    const baseUrl = getBaseUrl();
    const testUrl = `${baseUrl}/webhook-test${endpoint}`;
    const prodUrl = `${baseUrl}/webhook${endpoint}`;

    try {
        console.log(`Intentando GET en (pruebas): ${testUrl}`);
        return await axios.get(testUrl);
    } catch (error: any) {
        console.warn(`URL de pruebas falló. Intentando con la de producción...`);
        try {
            console.log(`Intentando GET en (producción): ${prodUrl}`);
            return await axios.get(prodUrl);
        } catch (prodError: any) {
            console.error(`La URL de producción también falló.`);
            throw prodError; // Re-throw the final error to be caught by the component
        }
    }
};

/**
 * Performs a POST request, trying the test URL first and falling back to the production URL.
 * @param endpoint The API endpoint to hit (e.g., '/clients').
 * @param data The payload for the POST request.
 * @returns The axios response.
 */
export const apiPost = async (endpoint: string, data: any): Promise<AxiosResponse<any>> => {
    const baseUrl = getBaseUrl();
    const testUrl = `${baseUrl}/webhook-test${endpoint}`;
    const prodUrl = `${baseUrl}/webhook${endpoint}`;

    try {
        console.log(`Intentando POST en (pruebas): ${testUrl}`);
        return await axios.post(testUrl, data);
    } catch (error: any) {
        console.warn(`URL de pruebas falló. Intentando con la de producción...`);
        try {
            console.log(`Intentando POST en (producción): ${prodUrl}`);
            return await axios.post(prodUrl, data);
        } catch (prodError: any) {
            console.error(`La URL de producción también falló.`);
            throw prodError;
        }
    }
};
