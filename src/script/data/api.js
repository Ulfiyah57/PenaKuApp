import { fetchAccessToken } from '../utils/auth';

const BASE_URL = 'https://story-api.dicoding.dev/v1';

const ENDPOINTS = {
  // Authentication
  REGISTER: `${BASE_URL}/register`,
  LOGIN: `${BASE_URL}/login`,

  // Stories
  STORIES: `${BASE_URL}/stories`,
  STORY_DETAIL: (id) => `${BASE_URL}/stories/${id}`,
  GUEST_STORIES: `${BASE_URL}/stories/guest`,

  // Notifications
  SUBSCRIBE: `${BASE_URL}/notifications/subscribe`,
  UNSUBSCRIBE: `${BASE_URL}/notifications/subscribe`,
};

// Authentication
export async function registerUser({ name, email, password }) {
  const response = await fetch(ENDPOINTS.REGISTER, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password }),
  });

  return response.json();
}

export async function getLogin({ email, password }) {
  const response = await fetch(ENDPOINTS.LOGIN, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  return response.json();
}

// Stories
export async function getAllStories({ page = 1, size = 10, location = 0 } = {}) {
  const token = fetchAccessToken();
  const params = new URLSearchParams({ page, size, location });

  const response = await fetch(`${ENDPOINTS.STORIES}?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
}

export async function getStoryDetail(id) {
  const token = fetchAccessToken();
  const response = await fetch(ENDPOINTS.STORY_DETAIL(id), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
}

export async function storeNewstories({ description, photo, lat, lon }) {
  const token = fetchAccessToken();
  const formData = new FormData();
  
  formData.append('description', description);
  formData.append('photo', photo);
  if (lat) formData.append('lat', lat);
  if (lon) formData.append('lon', lon);

  const response = await fetch(ENDPOINTS.STORIES, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  return response.json();
}

export async function addGuestStory({ description, photo, lat, lon }) {
  const formData = new FormData();
  
  formData.append('description', description);
  formData.append('photo', photo);
  if (lat) formData.append('lat', lat.toString());
  if (lon) formData.append('lon', lon.toString());

  const response = await fetch(ENDPOINTS.GUEST_STORIES, {
    method: 'POST',
    body: formData,
  });

  return response.json();
}

// Notifications
export async function subscribeWebPush({ endpoint, keys: { p256dh, auth } }) {
  const token = fetchAccessToken(); 
  const response = await fetch(ENDPOINTS.SUBSCRIBE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ endpoint, keys: { p256dh, auth } }),
  });

  const json = await response.json();

  return {
    ...json,
    ok: response.ok,
  };
}

export async function unsubscribeWebPush({ endpoint }) {
  const token = await fetchAccessToken();
  const response = await fetch(ENDPOINTS.UNSUBSCRIBE, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ endpoint }),
  });

  const json = await response.json();

  return {
  ...json,
  ok: response.ok,
  };
}

export async function sendstoriesToMeViaNotification(storiesId) {
  // Simulasi kirim notifikasi berdasarkan ID laporan
  const token = fetchAccessToken();

  // Misal endpoint API-nya seperti ini (anggap ini dummy dulu)
  const response = await fetch(`${BASE_URL}/notifications/send/${storiesId}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await response.json();

  return {
    ...json,
    ok: response.ok,
  };
}
