import { tns } from 'tiny-slider';
import 'tiny-slider/dist/tiny-slider.css';

// Menunda eksekusi selama waktu tertentu (default 1 detik)
export function delay(duration = 1000) {
  return new Promise((resolve) => setTimeout(resolve, duration));
}

// Mengubah objek tanggal menjadi format yang terbaca sesuai lokal
export function formatReadableDate(date, locale = 'en-US', options = {}) {
  const formattingOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  };

  return new Date(date).toLocaleDateString(locale, formattingOptions);
}

export function showFormattedDate(date, locale = 'en-US', options = {}) {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  });
}

// Membuat komponen carousel secara dinamis menggunakan tiny-slider
export async function initCarousel(container, config = {}) {
  return tns({
    container,
    mouseDrag: true,
    swipeAngle: true,
    speed: 600,
    nav: true,
    navPosition: 'bottom',
    autoplay: false,
    controls: false,
    ...config,
  });
}

// Mengubah objek Blob menjadi string base64
export function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);

    reader.readAsDataURL(blob);
  });
}

// Mengonversi string base64 menjadi Blob
export function base64ToBlob(base64, mimeType = '', chunkSize = 512) {
  const binaryString = atob(base64);
  const byteGroups = [];

  for (let i = 0; i < binaryString.length; i += chunkSize) {
    const chunk = binaryString.slice(i, i + chunkSize);
    const byteArray = new Uint8Array([...chunk].map((char) => char.charCodeAt(0)));
    byteGroups.push(byteArray);
  }

  return new Blob(byteGroups, { type: mimeType });
}

// Mengubah base64 (URL-safe) menjadi Uint8Array
export function base64ToUint8Array(base64Str) {
  const padded = base64Str.padEnd(base64Str.length + ((4 - (base64Str.length % 4)) % 4), '=');
  const normalized = padded.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(normalized);

  return Uint8Array.from([...binary].map((char) => char.charCodeAt(0)));
}

// Menambahkan fitur "Skip to Content" untuk aksesibilitas
export function enableSkipToContent(button, targetElement) {
  button.addEventListener('click', () => targetElement.focus());
}

// Membantu melakukan transisi tampilan, atau fallback jika tidak didukung
export function handleViewTransition({ skipTransition = false, updateDOM }) {
  if (skipTransition || typeof document.startViewTransition !== 'function') {
    const done = Promise.resolve(updateDOM()).then(() => undefined);

    return {
      ready: Promise.reject(new Error('Transisi tampilan tidak didukung')),
      updateCallbackDone: done,
      finished: done,
    };
  }

  return document.startViewTransition(updateDOM);
}

export function isServiceWorkerAvailable() {
  return 'serviceWorker' in navigator;
}

export async function registerServiceWorker() {
  if (!isServiceWorkerAvailable()) {
    console.log('Service Worker API unsupported');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.bundle.js');
    console.log('Service worker telah terpasang', registration);
  } catch (error) {
    console.log('Failed to install service worker:', error);
  }
}
