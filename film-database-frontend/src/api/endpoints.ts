// src/api/endpoints.ts
const BASE = process.env.REACT_APP_API_BASE_URL!;
if (!BASE) throw new Error('REACT_APP_API_BASE_URL not defined');

export const ENDPOINTS = {
  // Films
  MOVIES_LIST:    `${BASE}/films`,
  MOVIES_FULL:    `${BASE}/films/full`,
  MOVIE_DETAILS:  (id: string) => `${BASE}/films/${id}`,

  // Poster
  GET_POSTER:     (filmId: string) => `${BASE}/films/${filmId}/poster`,
  UPLOAD_POSTER:  (filmId: string) => `${BASE}/films/${filmId}/poster`,
  DELETE_POSTER:  (filmId: string) => `${BASE}/films/${filmId}/poster`,

  // Gallery (max 3 images per film)
  GET_GALLERY:    (filmId: string) => `${BASE}/films/${filmId}/gallery`,
  UPLOAD_IMAGE:   (filmId: string) => `${BASE}/films/${filmId}/gallery`,
  DELETE_IMAGE:   (filmId: string, imageId: number | string) =>
                     `${BASE}/films/${filmId}/gallery/${imageId}`,

  // Documents (single PDF/DOC per film)
  GET_DOCUMENTS:     (filmId: string) => `${BASE}/films/${filmId}/documents`,
  UPLOAD_DOCUMENT:   (filmId: string) => `${BASE}/films/${filmId}/documents`,
  DELETE_DOCUMENT:   (filmId: string, docId: number | string) =>
                         `${BASE}/films/${filmId}/documents/${docId}`,

  // Auth & Users
  LOGIN:          `${BASE}/login`,
  USERS:          `${BASE}/users`,
  USER:           (id: number | string) => `${BASE}/users/${id}`,
};
