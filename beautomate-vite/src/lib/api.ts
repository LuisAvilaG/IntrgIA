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
 * Performs a GET request with fallback logic and cancellation support.
 * @param endpoint The API endpoint.
 * @param signal Optional AbortSignal to cancel the request.
 * @returns The axios response.
 */
export const apiGet = async (endpoint: string, signal?: AbortSignal): Promise<AxiosResponse<any>> => {
    const baseUrl = getBaseUrl();
    const testUrl = `${baseUrl}/webhook-test${endpoint}`;
    const prodUrl = `${baseUrl}/webhook${endpoint}`;

    try {
        return await axios.get(testUrl, { signal });
    } catch (error: any) {
        if (axios.isCancel(error)) {
            console.log('Request canceled:', error.message);
            throw error;
        }
        try {
            return await axios.get(prodUrl, { signal });
        } catch (prodError: any) {
            console.error(`API GET request to ${endpoint} failed on both test and prod URLs.`);
            throw prodError;
        }
    }
};

/**
 * Performs a POST request with fallback logic and cancellation support.
 * @param endpoint The API endpoint.
 * @param data The payload for the request.
 * @param signal Optional AbortSignal to cancel the request.
 * @returns The axios response.
 */
export const apiPost = async (endpoint: string, data: any, signal?: AbortSignal): Promise<AxiosResponse<any>> => {
    const baseUrl = getBaseUrl();
    const testUrl = `${baseUrl}/webhook-test${endpoint}`;
    const prodUrl = `${baseUrl}/webhook${endpoint}`;

    try {
        return await axios.post(testUrl, data, { signal });
    } catch (error: any) {
        if (axios.isCancel(error)) {
            // Don't treat cancellation as a fallback-worthy error
            throw error;
        }
        try {
            return await axios.post(prodUrl, data, { signal });
        } catch (prodError: any) {
            console.error(`API POST request to ${endpoint} failed on both test and prod URLs.`);
            throw prodError;
        }
    }
};
