import {
  createLoaderAbsoluteHTML,
  createstoriesItemHTML,
  createstoriesListEmptyHTML,
  createstoriesErrorHTML,
} from '../../templates';
import MarkedbookPresenter from './bookmark-presenter';
import Database from '../../data/database';
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

export default class MarkedbookPage {
  #presenter = null;
  #map = null;

  async render() {
    return `
      <section class="container">
        <h1 class="section-title">List of Saved Stories</h1>
 
        <div class="listStory-list__container"">
          <div id="listStory-list"></div>
          <div id="listStory-list-loading-container"></div>
        </div>
      </section>
    `;
  }
 
  async afterRender() {
    this.#presenter = new MarkedbookPresenter({
      view: this,
      model: Database,
    });

    await this.#presenter.initialGalleryAndMap();
  }
 
  populateMarkedbookStories(message, stories) {
    if (stories.length <= 0) {
      this.populateMarkedbookStoriesListEmpty();
      return;
    }
 
    const html = stories.reduce((accumulator, stories) => {
      return accumulator.concat(
        createstoriesItemHTML({
          ...stories,
          placeNameLocation: stories.location.placeName,
          storytellersName: stories.name,
        }),
      );
    }, '');
 
    document.getElementById('listStory-list').innerHTML = `
      <div class="listStory-list">${html}</div>
    `;
  }
 
  populateMarkedbookStoriesListEmpty() {
    document.getElementById('listStory-list').innerHTML = createstoriesListEmptyHTML();
  }
 
  populateMarkedbookStoriesError(message) {
    document.getElementById('listStory-list').innerHTML = createstoriesErrorHTML(message);
  }
 
  showStoriesListLoading() {
    document.getElementById('listStory-list-loading-container').innerHTML =
      createLoaderAbsoluteHTML();
  }

  hideStoriesListLoading() {
    document.getElementById('listStory-list-loading-container').innerHTML = '';
  }
}