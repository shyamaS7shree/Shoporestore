export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export function buildApiUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;

  const baseUrl = API_URL.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${baseUrl}${normalizedPath}`;
}

export function apiFetch(path: string, init?: RequestInit) {
  return fetch(buildApiUrl(path), init);
}

async function parseApiResponse(res: Response) {
  const text = await res.text();
  let data: any = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text || `Request failed with status ${res.status}` };
  }

  if (!res.ok) {
    return {
      success: false,
      message: data.message || data.error || `Request failed with status ${res.status}`,
      ...data,
    };
  }

  return data;
}

async function apiRequest(path: string, init: RequestInit) {
  try {
    const res = await apiFetch(path, init);
    return parseApiResponse(res);
  } catch {
    return {
      success: false,
      message: API_URL
        ? `Cannot connect to API server at ${API_URL}. Start the backend or update NEXT_PUBLIC_API_URL.`
        : 'Cannot connect to API server. Please try again.',
    };
  }
}

// ── REGISTER ─────────────────────────────────────
export async function registerUser(data: {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}) {
  return apiRequest('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

// ── LOGIN ─────────────────────────────────────────
export async function loginUser(data: {
  email: string;
  password: string;
}) {
  return apiRequest('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

// ── SAVE TOKEN ────────────────────────────────────
export function saveAuth(accessToken: string, refreshToken: string, user: any, remember = true) {
  const storage = remember ? localStorage : sessionStorage;
  const otherStorage = remember ? sessionStorage : localStorage;

  otherStorage.removeItem('accessToken');
  otherStorage.removeItem('refreshToken');
  otherStorage.removeItem('user');

  storage.setItem('accessToken', accessToken);
  storage.setItem('refreshToken', refreshToken);
  storage.setItem('user', JSON.stringify(user));
}

// ── GET TOKEN ─────────────────────────────────────
export function getToken() {
  return localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
}

export function getRefreshToken() {
  return localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
}

// ── GET USER ──────────────────────────────────────
export function getUser() {
  const user = localStorage.getItem('user') || sessionStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

// ── LOGOUT ────────────────────────────────────────
export function logout() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  sessionStorage.removeItem('accessToken');
  sessionStorage.removeItem('refreshToken');
  sessionStorage.removeItem('user');
}

// ── SUBSCRIBE ─────────────────────────────────────
export async function subscribeNewsletter(data: {
  email: string;
  name?: string;
}) {
  return apiRequest('/api/subscriber/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function loginWithPhone(data: {
  phone: string;
  password: string;
}) {
  return apiRequest('/api/auth/phone-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function requestLoginOtp(data: {
  phone: string;
}) {
  return apiRequest('/api/auth/email-otp/request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function verifyLoginOtp(data: {
  phone: string;
  otp: string;
}) {
  return apiRequest('/api/auth/email-otp/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function resetPassword(data: {
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
}) {
  return apiRequest('/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}
