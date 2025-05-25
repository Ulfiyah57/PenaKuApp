import {
  createstoriesItemHTML,
  createstoriessErrorHTML,
  createLoaderAbsoluteHTML,
} from '../../templates';
import HomePresenter from './home-presenter';
import * as PenaKuAPI from '../../data/api';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// FIX: Override default icon agar tidak 404
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export default class HomePage {
  #presenter = null;


  async render() {
    return `
      <section>
        <div class="listStory-list__map__container" id="home">
          <div id="map" style="width: 100%; height: 400px;"></div>
        </div>
      </section>

      <section class="container">
        <h1 class="section-title">Our Story List</h1>

        <div class="listStory-list__container">
          <div id="listStory-list"></div>
          <div id="listStory-list-loading-container"></div>
        </div>
      </section>

      <section class="container">
        <div id="push-notification-tools"></div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new HomePresenter({
      view: this,
      model: PenaKuAPI,
    });

    // Inisialisasi peta
    await this.initialMap();
    await this.#presenter.initializestoriessPage();

    document.getElementById('center-pin')?.remove();
  }

  /**
   * Menampilkan daftar cerita ke dalam elemen HTML.
   * Jika data kosong, tampilkan tampilan kosong.
   */
  populatestoriessList(message, listStory) {
    if (listStory.length === 0) {
      this.populatestoriessListEmpty();
      return;
    }

    const listStoryHTML = listStory
      .map((stories) =>
        createstoriesItemHTML({
          ...stories,
          storieserName: stories.name,
        }),
      )
      .join('');

    document.getElementById('listStory-list').innerHTML = `
      <div class="listStory-list">${listStoryHTML}</div>
    `;

   // ✅ Tambahkan marker ke map
    listStory.forEach((stories) => {
      if (stories.lat && stories.lon) {
        const marker = L.marker([stories.lat, stories.lon]).addTo(this._map);
        marker.bindPopup(`<b>${stories.name}</b><br>${stories.description || ''}`);
      }
    });
  }

  /**
   * Menampilkan tampilan kosong ketika tidak ada laporan.
   */
  populatestoriessListEmpty() {
    document.getElementById('listStory-list').innerHTML = createstoriesItemHTML();
  }

  /**
   * Menampilkan pesan kesalahan saat gagal memuat laporan.
   */
  populatestoriessListError(message) {
    document.getElementById('listStory-list').innerHTML = createstoriessErrorHTML(message);
  }

  async initialMap() {
    // Hapus map sebelumnya jika sudah ada
    if (this._map) {
      this._map.remove();
    }

    // Inisialisasi map baru
    this._map = L.map('map').setView([-6.2, 106.816666], 11);

    // Tambahkan tile layer dari OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this._map);

    // Tambahkan listener untuk ambil koordinat tengah setelah peta digeser
    this._map.on('moveend', () => {
      const center = this._map.getCenter();
      console.log('Koordinat tengah:', center.lat, center.lng);
    });
  }
  /**
   * Menghapus loading spinner dari daftar laporan.
   */
  hideLoading() {
    document.getElementById('listStory-list-loading-container').innerHTML = '';
  }
}
