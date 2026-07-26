// src/api/client.ts

import { ENDPOINTS } from './endpoints';

function authHeader(): Record<string, string> {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// --- Movies ---

export async function fetchMovies(): Promise<{ films: any[] }> {
  const res = await fetch(ENDPOINTS.MOVIES_LIST, { headers: authHeader() });
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}

export async function fetchFullFilms(token: string): Promise<{ films: any[] }> {
  const res = await fetch(ENDPOINTS.MOVIES_FULL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}

export async function fetchMovieDetails(
  id: string,
  token?: string
): Promise<any> {
  const headers = token
    ? { Authorization: `Bearer ${token}` }
    : authHeader();
  const res = await fetch(ENDPOINTS.MOVIE_DETAILS(id), { headers });
  if (res.status === 401) {
    const err = new Error('Unauthorized');
    err.name = 'Unauthorized';
    throw err;
  }
  if (!res.ok) {
    throw new Error(`Movie fetch failed: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

// --- Authentication ---

export async function login(
  username: string,
  password: string
): Promise<{ access_token: string }> {
  const res = await fetch(ENDPOINTS.LOGIN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error('Invalid credentials');
  return res.json();
}

// --- Users ---

export async function fetchUsers(): Promise<{ users: any[] }> {
  const res = await fetch(ENDPOINTS.USERS, { headers: authHeader() });
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}

export async function addUser(
  username: string,
  password: string,
  role = 'reader'
): Promise<any> {
  const res = await fetch(ENDPOINTS.USERS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify({ username, password, role }),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function updateUser(
  id: number,
  username: string,
  password: string
): Promise<any> {
  const res = await fetch(ENDPOINTS.USER(id), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function deleteUser(id: number): Promise<void> {
  const res = await fetch(ENDPOINTS.USER(id), {
    method: 'DELETE',
    headers: authHeader(),
  });
  if (!res.ok) throw new Error('Failed to delete user');
}

// --- Films CRUD ---

export async function addFilm(data: any): Promise<any> {
  const res = await fetch(ENDPOINTS.MOVIES_LIST, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function updateFilm(id: string, data: any): Promise<any> {
  const res = await fetch(ENDPOINTS.MOVIE_DETAILS(id), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function deleteFilm(id: string): Promise<void> {
  const res = await fetch(ENDPOINTS.MOVIE_DETAILS(id), {
    method: 'DELETE',
    headers: authHeader(),
  });
  if (!res.ok) throw new Error('Failed to delete film');
}

// --- Asset uploads ---

export async function uploadDocument(
  filmId: string,
  file: File
): Promise<void> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(ENDPOINTS.UPLOAD_DOCUMENT(filmId), {
    method: 'POST',
    body: form,
    headers: authHeader(),
  });
  if (!res.ok) throw new Error('Document upload failed');
}
