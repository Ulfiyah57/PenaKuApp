export default class AddNewPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

// Add-New-presenter.js
async displayMapForNewForm() {
  try {
    await this.#view.initialMap(); // Ganti ke method yang benar
  } catch (error) {
    console.error('Error initializing map:', error);
    // Tambahkan fallback atau error handling
    this.#view.showMapError("Failed to load map");
  }
}

async submitNewstories({ description, evidenceImages, lat, lon }) {
  this.#view.showSubmitLoadingButton();
  try {
    const photo = evidenceImages.length > 0 ? evidenceImages[0] : null;

    const result = await this.#model.storeNewstories({ description, photo, lat, lon });

    if (!result.ok) {
      console.error('submitNewstories response error:', result);
      this.#view.storeFailed(result.message);
      return;
    } else {
      console.log('submitNewstories response success:', result.message);
    }

    // Kirim push notification dengan payload yang berisi deskripsi story
    this.#notifyToAllUser(result.data.id, description);

    this.#view.storeSuccessfully(result.message, result.data);
  } catch (error) {
    console.error('submitNewstories failed:', error);
    this.#view.storeFailed(error.message);
  } finally {
    this.#view.hideSubmitLoadingButton();
  }
}

async #notifyToAllUser(storiesId, description) {
  try {
    // Buat payload notifikasi sesuai format JSON schema
      const payload = {
        title: "Story Baru Dibuat!",
        options: {
          body: description 
            ? (description.length > 50 
                ? `${description.substring(0, 50)}...` 
                : description)
            : "Story tanpa deskripsi",
          data: {
            storyId: storiesId,
            url: `/stories/${storiesId}`
          }
        }
      };

      console.log('Sending notification payload:', payload);

    // Kirim payload ke model supaya diteruskan ke Web Push API
    const response = await this.#model.sendstoriesToAllUserViaNotification(storiesId, payload);

    if (!response.ok) {
      console.error('#notifyToAllUser: response:', response);
      return false;
    }

    console.log('Notification sent successfully');
      return true;
    } catch (error) {
      console.error('Notification error:', error);
      return false;
    }
  }
  }  

