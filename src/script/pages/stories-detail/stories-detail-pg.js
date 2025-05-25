// stories-detail-pg.js (Updated integration with templates)

import {
  createLoaderAbsoluteHTML,
  createstoriesDetailHTML,
  createstoriesDetailErrorHTML ,
  createSavestoriesButtonHTML,
  createRemovestoriesButtonHTML,
} from '../../templates';
import { initCarousel } from '../../utils/index';
import storyDetailPresenter from '../stories-detail/stories-detail-presenter';
import { parseActivePathname } from '../../routes/url-parser';
import CustomMap from '../../utils/map';
import * as PenaKuAPI from '../../data/api';
import Database from '../../data/database';


export default class storiesDetailPage {
  #presenter = null;
  #form = null;
  #map = null;

async render() {
  return `
    <section class="stories-detail__container">
      <div id="stories-detail" class="stories-detail"></div>
      <div id="map" class="map" style="height: 300px;"></div>
      <div id="stories-detail-loading-container"></div>
    </section>

    <section class="container stories-detail__comments__container">
      <hr class="divider" />

      <div class="stories-detail__comments-form__container">
        <h2 class="stories-detail__comments-form__title">
          <i class="fas fa-comment-dots"></i> Give Feedback
        </h2>
        <form id="comments-list-form" class="stories-detail__comments-form__form">
          <textarea
            name="body"
            placeholder="Tell us what you think about this story..."
            class="form-control"
          ></textarea>
          <div id="submit-button-container" class="submit-button-container">
            <button class="btn btn-primary" type="submit">
              <i class="fas fa-paper-plane"></i> Share
            </button>
          </div>
        </form>
      </div>

      <hr class="divider" />

      <div class="stories-detail__comments-list__container">
        <h3 class="stories-detail__comments-form__title">
          <i class="fas fa-comments"></i> All Comments
        </h3>
        <div id="stories-detail-comments-list" class="comments-list"></div>
        <div id="comments-list-loading-container"></div>
      </div>
    </section>
  `;
}


async afterRender() {
  this.#presenter = new storyDetailPresenter(parseActivePathname().id, {
    view: this,
    apiModel: PenaKuAPI,
    dbModel: Database,
  });

  this.#initializeCommentForm();

  this.#presenter.displaystoriesDetails();
}

  async loadstoriesDetailAndMap(message, stories) {
    document.getElementById('stories-detail').innerHTML = createstoriesDetailHTML({
      name: stories.name,
      description: stories.description,
      photoUrl: stories.photoUrl,
      lat: stories.lat,
      lon: stories.lon,
      createdAt: stories.createdAt,
    });

  
    await this.#presenter.displaystoriesDetail();
  
    this.#presenter.displaySaveButton();
    this.#addNotificationListener();

    // marker ke peta
    if (stories.lat && stories.lon) {
      this.#map.addMarker([stories.lat, stories.lon], {
        popup: {
          content: `<b>${stories.name}</b><br>${stories.description}`,
        },
      });

      this.#map.setView([stories.lat, stories.lon], 15);
    }
  }  

  renderstoriesDetailError(message) {
    document.getElementById('stories-detail').innerHTML = createstoriesDetailErrorHTML(message);
  }

  renderCommentsList(message, comments) {
    if (comments.length === 0) {
      this.renderEmptyCommentsList();
      return;
    }

    const html = comments.reduce((acc, comment) => {
      return acc.concat(
        createCommentItemHTML({
          photoUrlCommenter: comment.commenter.photoUrl,
          nameCommenter: comment.commenter.name,
          body: comment.body,
        }),
      );
    }, '');

    document.getElementById('stories-detail-comments-list').innerHTML = `
      <div class="__comments-list">${html}</div>
    `;
  }

  renderEmptyCommentsList() {
    document.getElementById('stories-detail-comments-list').innerHTML = createEmptyCommentsHTML();
  }

  renderCommentsError(message) {
    document.getElementById('stories-detail-comments-list').innerHTML = createCommentsErrorHTML(message);
  }

  async initialMap() {
  try {
    this.#map = await CustomMap.build('#map', {
      locate: true, // Atur peta ke lokasi pengguna jika tersedia
      zoom: 15,
    });

    // Misalnya, tambahkan listener klik di peta
    this.#map.addMapEventListener('click', async (event) => {
      const { lat, lng } = event.latlng;
      const placeName = await this.#map.getPlaceNameByCoordinate(lat, lng);

      this.#map.addMarker([lat, lng], {
        popup: {
          content: `Anda mengklik: ${placeName}`,
        },
      });
    });
  } catch (error) {
    console.error('Gagal inisialisasi peta:', error);
  }
}

  #initializeCommentForm() {
    this.#form = document.getElementById('comments-list-form');
    this.#form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const formData = {
        body: this.#form.elements.namedItem('body').value,
      };
      await this.#presenter.submitComment(formData);
    });
  }

  handleCommentPostSuccess(message) {
    console.log(message);
    this.#presenter.loadstoriesComments();
    this.#resetForm();
  }

  handleCommentPostFailure(message) {
    alert(message);
  }

  #resetForm() {
    this.#form.reset();
  }

  renderSaveButton() {
    document.getElementById('submit-button-container').innerHTML = createSavestoriesButtonHTML();
    document.getElementById('stories-detail-save').addEventListener('click', () => {
      this.#presenter.saveStories();
    });
  }

saveToBookmarkSuccessfully(message) {
    console.log(message);
  }

saveToBookmarkFailed(message) {
    alert(message);
}

renderRemoveButton() {
  const container = document.getElementById('submit-button-container');
  container.innerHTML = createRemovestoriesButtonHTML();

  const removeBtn = document.getElementById('stories-detail-remove');
  removeBtn.addEventListener('click', async () => {
    await this.#presenter.removeStories();
  });
}

removeFromBookmarkSuccessfully(message) {
  console.log(message);
}

removeFromBookmarkFailed(message) {
  alert(message);
}



  #addNotificationListener() {
    document.getElementById('stories-detail-notify-me').addEventListener('click', () => {
      this.#presenter.sendstoriesNotification();
    });
  }

  showDetailLoading() {
    document.getElementById('stories-detail-loading-container').innerHTML = createLoaderAbsoluteHTML();
  }

  hideDetailLoading() {
    document.getElementById('stories-detail-loading-container').innerHTML = '';
  }

  showMapLoading() {
    document.getElementById('map-loading-container').innerHTML = createLoaderAbsoluteHTML();
  }

  hideMapLoading() {
    document.getElementById('map-loading-container').innerHTML = '';
  }

  showCommentsLoading() {
    document.getElementById('comments-list-loading-container').innerHTML = createLoaderAbsoluteHTML();
  }

  hideCommentsLoading() {
    document.getElementById('comments-list-loading-container').innerHTML = '';
  }

  showSubmitLoadingButton() {
    document.getElementById('submit-button-container').innerHTML = `
      <button class="btn" type="submit" disabled>
        <i class="fas fa-spinner loader-button"></i> Tanggapi
      </button>
    `;
  }

  hideSubmitLoadingButton() {
    document.getElementById('submit-button-container').innerHTML = `
      <button class="btn" type="submit">Tanggapi</button>
    `;
  }
}
