/**
 * Smart API base URL resolver.
 *
 * It will use VITE_BACKEND_PROD_URL for production builds,
 * avoiding localhost errors in deployed mobile apps!
 */

import { Capacitor } from '@capacitor/core';

export function resolveBackendUrl() {
  if (import.meta.env.PROD) {
    // When built using `npm run build` or `vite build`, PROD is true
    return import.meta.env.VITE_BACKEND_PROD_URL || 'https://api.yourdomain.com';
  }

  // Local development / debug fallback
  const isNative = Capacitor.isNativePlatform();
  if (isNative && import.meta.env.VITE_BACKEND_LAN_URL) {
    return import.meta.env.VITE_BACKEND_LAN_URL;
  }
  return import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
}

export const API_BASE = resolveBackendUrl();

/** Convenience: GET with auth token */
export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  return res;
}
