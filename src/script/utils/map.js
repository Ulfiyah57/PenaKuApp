import { map, tileLayer, icon, marker, popup, latLng } from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { MAP_SERVICE_API_KEY } from '../config';

export default class CustomMap {
  #zoom = 15;
  #map = null;
  #defaultCenter = [-6.2, 106.816666]; // Jakarta

  constructor(selector, options = {}) {
    const mapElement = document.querySelector(selector);
    if (!mapElement) throw new Error(`Map container '${selector}' not found`);

    this.#zoom = options.zoom || this.#zoom;
    this.#map = map(mapElement, {
      zoom: this.#zoom,
      center: options.center || this.#defaultCenter,
      scrollWheelZoom: false,
      layers: [
        tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }),
      ],
      ...options,
    });
  }

  static async getPlaceNameByCoordinate(latitude, longitude) {
    try {
      const url = new URL(`https://api.maptiler.com/geocoding/${longitude},${latitude}.json`);
      url.searchParams.set('key', MAP_SERVICE_API_KEY);
      url.searchParams.set('language', 'id');
      url.searchParams.set('limit', '1');

      const response = await fetch(url);
      if (!response.ok) throw new Error(`Geocoding API error: ${response.status}`);

      const json = await response.json();
      if (!json.features || json.features.length === 0) {
        return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      }

      const place = json.features[0].place_name.split(', ');
      return [place.at(-2), place.at(-1)].filter(Boolean).join(', ');
    } catch (error) {
      console.error('Geocoding failed:', error);
      return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    }
  }

  isGeolocationAvailable() {
    return 'geolocation' in navigator;
  }

  async getCurrentPosition(options = {}) {
    if (!this.isGeolocationAvailable()) {
      throw new Error('Geolocation is not supported by your browser');
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        resolve,
        (error) => reject(new Error(this.#getGeolocationError(error))),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
          ...options,
        }
      );
    });
  }

  #getGeolocationError(error) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return 'Location access was denied';
      case error.POSITION_UNAVAILABLE:
        return 'Location information is unavailable';
      case error.TIMEOUT:
        return 'Location request timed out';
      default:
        return 'Unable to determine your location';
    }
  }

  static async build(selector, options = {}) {
    // Bersihkan instance map lama jika ada
    const container = document.querySelector(selector);
    if (container != null && container._leaflet_id != null) {
      container._leaflet_id = null;
    }
  
    const mapInstance = new CustomMap(selector, options);
  
    if (options.locate) {
      try {
        const position = await mapInstance.getCurrentPosition();
        mapInstance.setView([position.coords.latitude, position.coords.longitude]);
      } catch (error) {
        console.warn('Using default center:', error.message);
      }
    }
  
    return mapInstance;
  }  

  flyTo(coordinate, zoomLevel = this.#zoom) {
    this.#map.flyTo(latLng(coordinate), zoomLevel, {
      duration: 1,
      easeLinearity: 0.25,
    });
  }

  getCenter() {
    const center = this.#map.getCenter();
    return {
      latitude: center.lat,
      longitude: center.lng,
    };
  }

  createIcon(options = {}) {
    return icon({
      iconUrl: markerIcon,
      iconRetinaUrl: markerIcon2x,
      shadowUrl: markerShadow,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
      ...options,
    });
  }

  addMarker(coordinates, options = {}) {
    const markerInstance = marker(latLng(coordinates), {
      icon: this.createIcon(options.icon),
      draggable: options.draggable || false,
      ...options,
    }).addTo(this.#map);

    if (options.popup) {
      markerInstance.bindPopup(
        popup(options.popup)
          .setLatLng(latLng(coordinates))
          .setContent(options.popup.content || '')
      );
    }

    return markerInstance;
  }

  addMapEventListener(eventName, callback) {
    this.#map.on(eventName, callback);
    return () => this.#map.off(eventName, callback);
  }

  remove() {
    if (this.#map) {
      this.#map.remove();
      this.#map = null;
    }
  }

  fitBounds(bounds, options = {}) {
    this.#map.fitBounds(bounds, {
      padding: [50, 50],
      maxZoom: 18,
      ...options,
    });
  }

  setView(center, zoom = this.#zoom) {
    this.#map.setView(latLng(center), zoom);
  }
}
