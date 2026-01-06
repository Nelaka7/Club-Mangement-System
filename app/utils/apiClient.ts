// API Client utility for authenticated requests with HTTP-only cookies

const API_BASE_URL = 'http://localhost:5000';

interface RequestOptions extends RequestInit {
    requiresAuth?: boolean;
}

// Request queue for handling token refresh
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any = null) => {
    failedQueue.forEach((promise) => {
        if (error) {
            promise.reject(error);
        } else {
            promise.resolve();
        }
    });
    failedQueue = [];
};

/**
 * Centralized API client that automatically handles JWT cookies and token refresh
 */
export const apiClient = async (
    endpoint: string,
    options: RequestOptions = {}
): Promise<Response> => {
    const { requiresAuth = true, headers = {}, ...restOptions } = options;

    // Build headers (no manual token injection - cookies sent automatically)
    const requestHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(headers as Record<string, string>),
    };

    // Make the request
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

    const makeRequest = async (): Promise<Response> => {
        return fetch(url, {
            ...restOptions,
            headers: requestHeaders,
            credentials: 'include', // Always include cookies
        });
    };

    try {
        let response = await makeRequest();

        // Handle 401 Unauthorized - token expired or invalid
        if (response.status === 401 && requiresAuth) {
            if (isRefreshing) {
                // If already refreshing, queue this request
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => {
                    // Retry the original request after refresh completes
                    return makeRequest();
                });
            }

            // Start refresh process
            isRefreshing = true;

            try {
                // Call Next.js Route Handler to refresh token
                const refreshResponse = await fetch('/api/auth/refresh', {
                    method: 'POST',
                    credentials: 'include',
                });

                if (refreshResponse.ok) {
                    // Token refreshed successfully
                    isRefreshing = false;
                    processQueue(); // Retry all queued requests

                    // Retry the original request with new token
                    response = await makeRequest();
                } else {
                    // Refresh failed - logout user
                    isRefreshing = false;
                    processQueue(new Error('Token refresh failed'));

                    // Clear user data and redirect to sign-in
                    localStorage.removeItem('user');
                    if (typeof window !== 'undefined') {
                        window.location.href = '/sign-in';
                    }
                }
            } catch (refreshError) {
                isRefreshing = false;
                processQueue(refreshError);
                throw refreshError;
            }
        }

        return response;
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
};

/**
 * Helper function for GET requests
 */
export const apiGet = async (endpoint: string, requiresAuth = true): Promise<Response> => {
    return apiClient(endpoint, { method: 'GET', requiresAuth });
};

/**
 * Helper function for POST requests
 */
export const apiPost = async (
    endpoint: string,
    data: any,
    requiresAuth = true
): Promise<Response> => {
    return apiClient(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
        requiresAuth,
    });
};

/**
 * Helper function for PUT requests
 */
export const apiPut = async (
    endpoint: string,
    data: any,
    requiresAuth = true
): Promise<Response> => {
    return apiClient(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data),
        requiresAuth,
    });
};

/**
 * Helper function for DELETE requests
 */
export const apiDelete = async (endpoint: string, requiresAuth = true): Promise<Response> => {
    return apiClient(endpoint, { method: 'DELETE', requiresAuth });
};

export { API_BASE_URL };
