import NewPresenter from './add-new-presenter';
import { base64ToBlob } from '../../utils/index';
import * as PenaKuAPI from '../../data/api';
import { createLoaderAbsoluteHTML } from '../../templates';
import camera from '../../utils/camera';
import CustomMap from '../../utils/map';

export default class AddNewPage {
  #presenter;
  #formElement;
  #cameraHandler;
  #cameraIsActive = false;
  #capturedImages = [];
  #map = null;

  async render() {
    return `
      <section>
        <div class="new-stories__header">
          <div class="container">
            <h1 class="new-stories__header__title">Create New Story</h1>
            <p class="new-stories__header__description">
              Complete the following form to create your new story.<br>
              Make sure the story is a true story.
            </p>
          </div>
        </div>
      </section>

      <section class="container">
        <div class="new-form__container">
          <form id="new-form" class="new-form">

            <!-- Keterangan -->
            <div class="form-control">
              <label for="description-input">Keterangan</label>
              <textarea id="description-input" name="description" placeholder="Jelaskan lokasi, waktu, dan detail lainnya"></textarea>
            </div>

            <!-- Dokumentasi -->
            <div class="form-control">
              <label for="documentations-input">Dokumentasi</label>
              <div class="new-form__documentations__buttons">
                <button id="documentations-input-button" type="button">Upload Picture</button>
                <input id="documentations-input" name="documentations" type="file" accept="image/*"/>
                <button id="open-documentations-camera-button" type="button">Open Camera</button>
              </div>
              <div id="camera-container">
                <video id="camera-video"></video>
                <canvas id="camera-canvas"></canvas>
                <select id="camera-select"></select>
                <button id="camera-take-button" type="button">Take a picture</button>
              </div>
              <ul id="documentations-taken-list"></ul>
            </div>
            
            <div class="new-form__location__container">
            <div class="new-form__location__map__container">
            <!-- Map container - will be initialized with JavaScript -->
            <div id="map" class="new-form__location__map"></div>
            
            <!-- Loading indicator (hidden by default) -->
            <div id="map-loading-container" class="map-loading">
            <div class="loading-spinner"></div>
            <p>Loading map...</p>
            </div>
            </div>
            
            <!-- Coordinates display -->
            <div class="new-form__location__lat-lng">
            <div class="input-group">
            <label for="latitude-input">Latitude</label>
            <input 
            id="latitude-input" 
            type="number"
            name="latitude" 
            value="-6.175389"
            step="0.000001"
            readonly
            aria-label="Latitude coordinate">
            </div>
            <div class="input-group">
            <label for="longitude-input">Longitude</label>
            <input 
            id="longitude-input" 
            type="number" 
            name="longitude" 
            value="106.827139" 
            step="0.000001"
            readonly
            aria-label="Longitude coordinate">
            </div>
            </div>
            </div>

            <!-- Tombol Aksi -->
            <div class="form-buttons">
              <span id="submit-button-container">
              <button class="btn" type="submit">Create Your Story</button>
              </span>
              <a class="btn btn-outline" href="#/">Cancel</a>
            </div>
          </form>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new NewPresenter({ view: this, model: PenaKuAPI });
    this.#capturedImages = [];
    this.#initializeFormEvents();

    await this.#presenter.displayMapForNewForm();
    window.currentPage = this;
  }

  #initializeFormEvents() {
    this.#formElement = document.getElementById('new-form');
    this.#formElement.addEventListener('submit', async (event) => {
      event.preventDefault();

      const description = this.#formElement.elements.description.value;
      const lat = parseFloat(this.#formElement.elements.latitude.value);
      const lon = parseFloat(this.#formElement.elements.longitude.value);

      // Validate inputs
      if (!description) {
        alert('Description is required');
        return;
      }

      if (isNaN(lat) || isNaN(lon)) {
        alert('Valid coordinates are required');
        return;
      }

      // Prepare image data
      const evidenceImages = this.#capturedImages
        .filter((img) => img.blob instanceof Blob)
        .map((img) => img.blob);

      console.log('ini data evdence image', evidenceImages);

      await this.#presenter.submitNewstories({
        description,
        evidenceImages,
        lat: isNaN(lat) ? undefined : lat,
        lon: isNaN(lon) ? undefined : lon,
      });
    });

    document.getElementById('documentations-input').addEventListener('change', async (event) => {
      const filePromises = [...event.target.files].map((file) => this.#storeImage(file));
      await Promise.all(filePromises);
      await this.#refreshCapturedImages();
    });

    document.getElementById('documentations-input-button').addEventListener('click', () => {
      this.#formElement.elements['documentations-input'].click();
    });

    const cameraWrapper = document.getElementById('camera-container');
    document
      .getElementById('open-documentations-camera-button')
      .addEventListener('click', async (event) => {
        cameraWrapper.classList.toggle('open');
        this.#cameraIsActive = cameraWrapper.classList.contains('open');

        if (this.#cameraIsActive) {
          event.currentTarget.textContent = 'Tutup Kamera';
          this.#initializeCamera();
          await this.#cameraHandler.startCamera();
        } else {
          event.currentTarget.textContent = 'Buka Kamera';
          // Pastikan untuk menghentikan semua stream saat menutup kamera
          if (
            this.#cameraHandler &&
            typeof this.#cameraHandler.stopAllActiveStreams === 'function'
          ) {
            await this.#cameraHandler.stopAllActiveStreams();
          }
        }
      });
  }

  async initialMap() {
    this.showMapLoading();

    try {
      // FIX: Bersihkan Leaflet container jika sudah pernah diinisialisasi
      const mapElement = document.getElementById('map');
      if (mapElement && mapElement._leaflet_id) {
        mapElement._leaflet_id = null;
        mapElement.innerHTML = ''; // Bersihkan isi sebelumnya
      }

      // Inisialisasi map
      this.#map = await CustomMap.build('#map', {
        zoom: 15,
        locate: true,
      });

      // Get initial center coordinates
      const centerCoordinate = this.#map.getCenter();

      // Set initial input values
      this.#updateLocationInputs(centerCoordinate.latitude, centerCoordinate.longitude);

      // Add draggable marker
      const draggableMarker = this.#map.addMarker(
        [centerCoordinate.latitude, centerCoordinate.longitude],
        { draggable: true }, // Fixed: 'true' should be boolean true
      );

      // Handle marker movement
      draggableMarker.addEventListener('move', (event) => {
        const coordinate = event.target.getLatLng();
        this.#updateLocationInputs(coordinate.lat, coordinate.lng);
      });

      // Handle map clicks
      this.#map.addMapEventListener('click', (event) => {
        draggableMarker.setLatLng(event.latlng);
        this.#map.flyTo(event.latlng); // Simplified flyTo call
        this.#updateLocationInputs(event.latlng.lat, event.latlng.lng);
      });

      // Add geolocation button
      this.#addGeolocationButton();
    } catch (error) {
      console.error('Gagal inisialisasi peta:', error);
      this.showMapError('Gagal memuat peta. Silakan coba lagi.');
      throw error;
    } finally {
      this.hideMapLoading();
    }
  }

  #updateLocationInputs(latitude, longitude) {
    // Round to 6 decimal places (approx. 10cm precision)
    const lat = parseFloat(latitude.toFixed(6));
    const lng = parseFloat(longitude.toFixed(6));

    this.#formElement.elements.latitude.value = lat;
    this.#formElement.elements.longitude.value = lng;
  }

  #addGeolocationButton() {
    const button = document.createElement('button');
    button.className = 'locate-button';
    button.innerHTML = '<i class="fas fa-location-arrow"></i>';
    button.title = 'Find my location';
    button.addEventListener('click', () => this.#locateUser());

    // Add to map container
    document.querySelector('#map').appendChild(button);
  }

  async #locateUser() {
    try {
      this.showMapLoading();
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        });
      });

      const { latitude, longitude } = position.coords;
      this.#map.flyTo([latitude, longitude], 15);
      this.#updateLocationInputs(latitude, longitude);
    } catch (error) {
      console.error('Geolocation error:', error);
      alert('Could not determine your location. Please ensure location services are enabled.');
    } finally {
      this.hideMapLoading();
    }
  }

  showMapLoading() {
    const loader = document.getElementById('map-loading-container');
    loader.style.display = 'flex';
  }

  hideMapLoading() {
    const loader = document.getElementById('map-loading-container');
    loader.style.display = 'none';
  }

  #initializeCamera() {
    if (!this.#cameraHandler) {
      this.#cameraHandler = new camera({
        video: document.getElementById('camera-video'),
        cameraSelect: document.getElementById('camera-select'),
        canvas: document.getElementById('camera-canvas'),
      });
      // Pastikan metode stopAllActiveStreams ada
      if (typeof this.#cameraHandler.stopAllActiveStreams !== 'function') {
        console.error('stopAllActiveStreams is not a function on cameraHandler');
      }
      // Event listener untuk mengambil gambar
      document.getElementById('camera-take-button').addEventListener('click', async () => {
        const blob = await this.#cameraHandler.captureImage();
        await this.#storeImage(blob);
        await this.#refreshCapturedImages();
      });
    }
  }

  async #storeImage(image) {
    let blobData = image;

    // Convert base64 to Blob if needed
    if (typeof image === 'string') {
      blobData = await base64ToBlob(image, 'image/jpeg'); // Use appropriate MIME type
    }

    // Validate file size (1MB max)
    if (blobData.size > 1024 * 1024) {
      alert('Image size must be less than 1MB');
      return;
    }

    // Validate file type
    if (!blobData.type.match('image.*')) {
      alert('Only image files are allowed');
      return;
    }

    const newImage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      blob: blobData,
    };

    this.#capturedImages.push(newImage);
  }

  async #refreshCapturedImages() {
    const list = this.#capturedImages
      .filter((img) => img.blob instanceof Blob) // Pastikan hanya Blob yang valid
      .map(
        (img, index) => `
    <li>
      <button type="button" data-id="${img.id}">
        <img src="${URL.createObjectURL(img.blob)}" alt="Dokumentasi ${index + 1}">
      </button>
    </li>`,
      )
      .join('');

    const container = document.getElementById('documentations-taken-list');
    container.innerHTML = list;

    container.querySelectorAll('button[data-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        this.#deleteImage(id);
        this.#refreshCapturedImages();
      });
    });
  }

  #deleteImage(id) {
    this.#capturedImages = this.#capturedImages.filter((img) => img.id !== id);
  }

  storeSuccessfully(message) {
    console.log(message);
    this.clearForm();
    location.hash = '/';
  }

  storeFailed(message) {
    alert(message);
  }

  clearForm() {
    this.#formElement.reset();
  }

  showMapLoading() {
    document.getElementById('map-loading-container').innerHTML = createLoaderAbsoluteHTML();
  }

  hideMapLoading() {
    document.getElementById('map-loading-container').innerHTML = '';
  }

  destroy() {
    if (
      this.#cameraIsActive &&
      this.#cameraHandler &&
      typeof this.#cameraHandler.stopAllActiveStreams === 'function'
    ) {
      this.#cameraHandler?.stopAllActiveStreams?.();
      this.#cameraIsActive = false;
    }
  }

  //method showMapError disini
  showMapError(message) {
    const mapContainer = document.getElementById('map');
    mapContainer.innerHTML = `
    <div class="map-error">
      <p>${message}</p>
      <button id="retry-map-button">Coba Lagi</button>
    </div>
  `;

    document.getElementById('retry-map-button').addEventListener('click', () => {
      this.#presenter.displayMapForNewForm();
    });
  }
  showSubmitLoadingButton() {
    document.getElementById('submit-button-container').innerHTML = `
      <button class="btn" type="submit" disabled>
        <i class="fas fa-spinner loader-button"></i> Creating Your Story
      </button>
    `;
  }

  hideSubmitLoadingButton() {
    document.getElementById('submit-button-container').innerHTML = `
    <button class="btn" type="submit">Create Your Story</button>
    `;
  }
}
