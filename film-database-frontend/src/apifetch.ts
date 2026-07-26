// src/apifetch.ts

// Helper to get the token
const getAuthToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

// Your existing apiFetch for JSON-based requests
export async function apiFetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
  const token = getAuthToken();
  const headers = new Headers(init?.headers); // Initialize with existing headers if any

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  // Ensure Content-Type is set for JSON if there's a body and it's not FormData
  if (init?.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const options: RequestInit = {
    ...init,
    headers,
  };

  const response = await fetch(input, options);

  if (response.status === 401) {
    localStorage.removeItem('accessToken');
    window.dispatchEvent(new CustomEvent('tokenExpired', { detail: { message: 'Your session has expired. Please log in again.' } }));
    // You might want to redirect to login or let the component handle it
    // For now, throwing an error to stop the current operation.
    throw new Error('Token expired. Please log in again.');
  }
  return response;
}

// New function specifically for file uploads (FormData)
export async function apiFetchFile(input: RequestInfo, init?: RequestInit): Promise<Response> {
  const token = getAuthToken();
  const headers = new Headers(init?.headers); // Initialize with existing headers if any

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  // DO NOT set 'Content-Type' for FormData; the browser must set it with the boundary.
  // If a 'Content-Type' header is present (e.g. 'application/json'), remove it.
  if (headers.has('Content-Type') && init?.body instanceof FormData) {
      headers.delete('Content-Type');
  }


  const options: RequestInit = {
    ...init, // Should contain method: 'POST' (or 'PUT') and body: FormData
    headers,
  };

  const response = await fetch(input, options);

  if (response.status === 401) {
    localStorage.removeItem('accessToken');
    window.dispatchEvent(new CustomEvent('tokenExpired', { detail: { message: 'Your session has expired. Please log in again.' } }));
    throw new Error('Token expired. Please log in again.');
  }
  return response;
}