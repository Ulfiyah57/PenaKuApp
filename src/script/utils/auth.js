import { getCurrentRoute } from '../routes/url-parser';
import { ACCESS_TOKEN_KEY } from '../config';

// Ambil token
export function fetchAccessToken() {
  try {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token || token === 'null' || token === 'undefined') return null;
    return token;
  } catch (err) {
    console.error('fetchAccessToken error:', err);
    return null;
  }
}

// Simpan token
export function storeAccessToken(token) {
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    return true;
  } catch (err) {
    console.error('storeAccessToken error:', err);
    return false;
  }
}

// Hapus token
export function clearAccessToken() {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    return true;
  } catch (err) {
    console.error('clearAccessToken error:', err);
    return false;
  }
}

// Halaman khusus guest
const guestOnlyPages = ['/login', '/register'];

// Batasi akses jika sudah login
export function restrictAccessIfAuthenticated(component) {
  const currentRoute = getCurrentRoute();
  const isUserLoggedIn = !!fetchAccessToken();

  if (guestOnlyPages.includes(currentRoute) && isUserLoggedIn) {
    console.info(`🔐 Dilarang akses ${currentRoute} karena sudah login`);
    location.hash = '/';
    return null;
  }

  return component;
}

// Cegah akses jika belum login
export function enforceLoginForProtectedRoute(component) {
  const isUserLoggedIn = !!fetchAccessToken();

  if (!isUserLoggedIn) {
    console.warn('🔒 Anda harus login untuk mengakses halaman ini.');
    location.hash = '/login';
    return null;
  }

  return component;
}

// Logout
export function logoutUser() {
  clearAccessToken();
  console.info('🚪 Logout berhasil. Mengalihkan ke halaman login...');
  location.hash = '/login';
}
