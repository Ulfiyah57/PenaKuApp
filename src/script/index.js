// Mengimpor file CSS utama dan pendukung
import '../styles/styles.css';
import '../styles/responsives.css';
import 'tiny-slider/dist/tiny-slider.css';
import 'leaflet/dist/leaflet.css';

// Mengimpor komponen utama aplikasi dan utilitas kamera
import App from './pages/app.js';
import Camera from './utils/camera.js';
import { registerServiceWorker } from './utils/index.js';

// Menunggu seluruh elemen HTML dimuat sebelum menjalankan logika aplikasi
document.addEventListener('DOMContentLoaded', async () => {
  // Inisialisasi instance aplikasi dengan referensi ke elemen-elemen UI
  const appInstance = new App({
    content: document.getElementById('main-content'),
    drawerButton: document.getElementById('menu-toggle'),
    drawerNavigation: document.getElementById('side-navigation'),
    skipLinkButton: document.getElementById('skip-to-content'),
  });

  // Render halaman berdasarkan URL hash saat ini
  await appInstance.renderPage();
  await registerServiceWorker();

  // Dengarkan perubahan hash URL (navigasi SPA)
  window.addEventListener('hashchange', async () => {
    await appInstance.renderPage();

    // Hentikan semua stream media aktif seperti kamera
    const videoElement = document.querySelector('#videoElement');
if (videoElement) {
    Camera.stopAllActiveStreams(videoElement); // ganti semua yang pakai instance
}
});
});


