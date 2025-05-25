// utils/notification-helper.js
import { base64ToUint8Array } from './index';
import { VAPID_PUBLIC_KEY } from '../config';
import { subscribeWebPush, unsubscribeWebPush } from '../data/api';

// Mengecek apakah browser mendukung Notification API
export function canUseNotification() {
  return 'Notification' in window;
}

// Mengecek apakah pengguna sudah memberikan izin notifikasi
export function hasNotificationPermission() {
  return Notification.permission === 'granted';
}

// Meminta izin notifikasi dari pengguna
export async function askNotificationPermission() {
  if (!canUseNotification()) {
    console.warn('Browser tidak mendukung Notification API.');
    return false;
  }

  if (hasNotificationPermission()) {
    return true;
  }

  const result = await Notification.requestPermission();

  switch (result) {
    case 'denied':
      alert('Akses notifikasi ditolak oleh pengguna.');
      return false;
    case 'default':
      alert('Pengguna menutup atau mengabaikan permintaan notifikasi.');
      return false;
    default:
      return true;
  }
}

// Mengambil langganan push yang sedang aktif
export async function fetchPushSubscription() {
  const swReg = await navigator.serviceWorker.getRegistration();
  return await swReg?.pushManager.getSubscription();
}

// Mengecek apakah push subscription sudah tersedia
export async function isPushSubscribed() {
  const subscription = await fetchPushSubscription();
  return Boolean(subscription);
}

// Membuat opsi untuk proses subscribe
function createSubscriptionOptions() {
  return {
    userVisibleOnly: true,
    applicationServerKey: base64ToUint8Array(VAPID_PUBLIC_KEY),
  };
}

// Fungsi utama untuk melakukan subscribe
export async function handlePushSubscribe() {
  let subscription;
  
  const permissionGranted = await askNotificationPermission();
  if (!permissionGranted) return;

  const alreadySubscribed = await isPushSubscribed();
  if (alreadySubscribed) {
    alert('Kamu sudah berlangganan notifikasi.');
    return;
  }
  console.log('Sedang mendaftarkan ke Push Notification...');

  try {
    const swReg = await navigator.serviceWorker.getRegistration();
    if (!swReg) {
      alert('Service Worker belum terdaftar.');
      return;
    }

    const subscription = await swReg.pushManager.subscribe(createSubscriptionOptions());
    const { endpoint, keys } = subscription.toJSON();

    // Kirim data subscription ke server
    const response = await subscribeWebPush({ endpoint, keys });

    if (!response.ok) {
      console.error('Gagal menyimpan data langganan di server:', response);
      alert('Langganan notifikasi gagal disimpan. Silakan coba lagi.');
      await subscription.unsubscribe(); // Batalkan jika gagal menyimpan
      return;
    }

    console.log('Langganan berhasil:', { endpoint, keys });

    alert('Berhasil berlangganan notifikasi!');
    // Di sini bisa kirim subscription ke server jika perlu
  } catch (error) {
    console.error('Gagal melakukan subscribe ke push notification:', error);
    alert('Gagal berlangganan notifikasi.');
  }

  //batalkan langganannya
    if (subscription) {
      try {
        await subscription.unsubscribe();
        console.log('Langganan dibatalkan karena terjadi kesalahan.');
      } catch (unsubscribeError) {
        console.warn('Gagal membatalkan langganan:', unsubscribeError);
      }
    }
}

// Fungsi untuk melakukan unsubscribe dari push notification
export async function handlePushUnsubscribe() {
  const errorMessage = 'Gagal berhenti berlangganan notifikasi.';
  const successMessage = 'Berhasil berhenti berlangganan notifikasi.';

  try {
    const swRegistration = await navigator.serviceWorker.getRegistration();
    if (!swRegistration) {
      alert('Service Worker belum terdaftar.');
      return;
    }

    const subscription = await swRegistration.pushManager.getSubscription();
    if (!subscription) {
      alert('Kamu belum berlangganan notifikasi.');
      return;
    }

    const { endpoint, keys } = subscription.toJSON();

    // Kirim permintaan ke server untuk menghapus langganan
    const serverResponse = await unsubscribeWebPush({ endpoint });
    if (!serverResponse.ok) {
      alert(errorMessage);
      console.error('Gagal memutus langganan di server:', serverResponse);
      return;
    }

    // Hentikan langganan dari sisi client
    const unsubscribed = await subscription.unsubscribe();
    if (!unsubscribed) {
      alert(errorMessage);
      console.warn('Gagal menghentikan langganan dari browser.');
      // Coba subscribe kembali untuk rollback jika diperlukan
      await subscribeWebPush({ endpoint, keys });
      return;
    }

    console.log(successMessage);
    alert(successMessage);
  } catch (err) {
    console.error('Terjadi kesalahan saat berhenti berlangganan:', err);
    alert(errorMessage);
  }
}

