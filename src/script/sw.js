import { registerRoute } from 'workbox-routing';
import { CacheFirst } from 'workbox-strategies';
import { precacheAndRoute } from 'workbox-precaching';
// Do precaching
precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
  ({ url }) => url.href.startsWith('https://story-api.dicoding.dev/v1/#/'),
  new CacheFirst({
    cacheName: 'penaku-cache',
  }),
);

self.addEventListener('push', (event) => {
  console.log('Service worker pushing...');

  let data = {
    title: 'Story berhasil dibuat',
    options: {
      body: 'Anda telah membuat story baru dengan deskripsi: Tidak diketahui',
    },
  };

  // Jika ada data dari push (misalnya dari simulasi DevTools)
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      console.error('Data push bukan JSON. Gunakan default.');
    }
  }

  event.waitUntil(self.registration.showNotification(data.title, data.options));
});
