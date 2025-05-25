import { showFormattedDate } from './utils';

export function createLoaderAbsoluteHTML() {
  return `<div class="loader"></div>`;
}

export function createstoriesErrorHTML(message) {
  return `
    <div id="listStory-list-error" class="listStory-list__error">
      <h2>A story list retrieval error occurred</h2>
      <p>${message || 'Use another network or stories this error.'}</p>
    </div>
  `;
}

export function createMainNavigationListHTML() {
  return `
    <li><a id="stories-list-button" class="stories-list-button" href="#/">Daftar Cerita</a></li>
    <li><a id="bookmark-button" class="bookmark-button" href="#/bookmark">Cerita Tersimpan</a></li>
  `;
}

export function createUnauthenticatedNavigationListHTML() {
  return `
    <li id="push-notification-tools" class="push-notification-tools"></li>
    <li><a id="login-button" href="#/login">Login</a></li>
    <li><a id="register-button" href="#/register">Register</a></li>
  `;
}

export function createAuthenticatedNavigationListHTML() {
  return `
    <li id="push-notification-tools" class="push-notification-tools"></li>
    <li><a id="new-stories-button" class="btn new-stories-button" href="#/new">Buat Cerita <i class="fas fa-plus"></i></a></li>
    <li><a id="logout-button" class="logout-button" href="#/logout"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
  `;
}

export function createstoriesListEmptyHTML() {
  return `
    <div id="listStory-list-empty" class="listStory-list__empty">
      <h2>There is no list of stories available</h2>
      <p>Currently, no list of saved stories can be displayed.</p>
    </div>
  `;
}

export function createstoriesDetailErrorHTML(message) {
  return `
    <div id="listStory-list-error" class="listStory-list__error">
      <h2>Terjadi kesalahan pengambilan daftar cerita</h2>
      <p>${message ? message : 'Gunakan jaringan lain atau laporkan error ini.'}</p>
    </div>
  `;
}

export function createCommentsListEmptyHTML() {
  return `
    <div id="stories-detail-comments-list-empty" class="stories-detail__comments-list__empty">
      <h2>Tidak ada komentar yang tersedia</h2>
      <p>Saat ini, tidak ada komentar yang dapat ditampilkan.</p>
    </div>
  `;
}

export function createCommentsListErrorHTML(message) {
  return `
    <div id="stories-detail-comments-list-error" class="stories-detail__comments-list__error">
      <h2>Terjadi kesalahan pengambilan daftar komentar</h2>
      <p>${message ? message : 'Gunakan jaringan lain atau laporkan error ini.'}</p>
    </div>
  `;
}


export function createstoriesItemHTML({
  id,
  name,
  description,
  photoUrl,
  createdAt,
  lat,
  lon,
}) {
  return `
    <div tabindex="0" class="stories-item" data-storiesid="${id}">
      <img class="stories-item__image" src="${photoUrl}" alt="${description}">
      <div class="stories-item__body">
        <h2 class="stories-item__title">${name}</h2>
        <p class="stories-item__description">${description}</p>
        <div class="stories-item__info"> 
          <span><i class="fas fa-calendar-alt"></i> ${showFormattedDate(createdAt, 'id-ID')}</span>
          ${lat && lon ? `<span><i class="fas fa-map-marker-alt"></i> Latitude: ${lat}, Longitude: ${lon}</span>` : ''} 
        </div>
        <a class="btn stories-item__read-more" href="#/listStory/${id}">
          Selengkapnya <i class="fas fa-arrow-right"></i>
        </a>
      </div>
    </div>
  `;
}

export function createstoriesDetailImageHTML(imageUrl = null, alt = '') {
  if (!imageUrl) {
    return `
      <img class="stories-detail__image" src="images/placeholder-image.jpg" alt="Placeholder Image">
    `;
  }

  return `
    <img class="stories-detail__image" src="${imageUrl}" alt="${alt}">
  `;
}

export function createstoriesCommentItemHTML({ photoUrlCommenter, nameCommenter, body }) {
  return `
    <article tabindex="0" class="stories-detail__comment-item">
      <img
        class="stories-detail__comment-item__photo"
        src="${photoUrlCommenter}"
        alt="Commenter name: ${nameCommenter}"
      >
      <div class="stories-detail__comment-item__body">
        <div class="stories-detail__comment-item__body__more-info">
          <div class="stories-detail__comment-item__body__author">${nameCommenter}</div>
        </div>
        <div class="stories-detail__comment-item__body__text">${body}</div>
      </div>
    </article>
  `;
}

export function createstoriesDetailHTML({
  name,
  description,
  photoUrl,
  lat,
  lon,
  createdAt,
}) {
  const createdAtFormatted = showFormattedDate(createdAt, 'id-ID');
  const imageHtml = createstoriesDetailImageHTML(photoUrl, name);

  return `
    <div class="stories-detail__header">
      <div class="stories-detail__more-info">
        <div class="stories-detail__more-info__inline">
          <div id="createdat" class="stories-detail__createdat">
            <i class="fas fa-calendar-alt"></i> ${createdAtFormatted}
          </div>
        </div>
        <div class="stories-detail__more-info__inline">
          <div id="location-latitude" class="stories-detail__location__latitude">Latitude: ${lat}</div>
          <div id="location-longitude" class="stories-detail__location__longitude">Longitude: ${lon}</div>
        </div>
        <div id="author" class="stories-detail__author" data-value="${name}">Dilaporkan oleh: ${name}</div>
      </div>

    <div class="container">
      <div class="stories-detail__images__container">
        <div id="images" class="stories-detail__images">${imageHtml}</div>
      </div>
    </div>

    <div class="container">
      <div class="stories-detail__body">
        <div class="stories-detail__body__description__container">
          <h2 class="stories-detail__description__title">Informasi Lengkap</h2>
          <div id="description" class="stories-detail__description__body">${description}</div>
        </div>
        <div class="stories-detail__body__map__container">
          <h2 class="stories-detail__map__title">Peta Lokasi</h2>
          <div class="stories-detail__map__container">
            <div id="map" class="stories-detail__map"></div>
            <div id="map-loading-container"></div>
          </div>
        </div>
        <hr>
        <div class="stories-detail__body__actions__container">
          <h2>Aksi</h2>
          <div class="stories-detail__actions__buttons">
            <div id="save-actions-container"></div>
            <div id="notify-me-actions-container">
              <button id="stories-detail-notify-me" class="btn btn-transparent">
                Try Notify Me <i class="far fa-bell"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function createSubscribeButtonHTML() {
  return `
    <button id="subscribe-button" class="btn subscribe-button">
      Subscribe <i class="fas fa-bell"></i>
    </button>
  `;
}

export function createUnsubscribeButtonHTML() {
  return `
    <button id="unsubscribe-button" class="btn unsubscribe-button">
      Unsubscribe <i class="fas fa-bell-slash"></i>
    </button>
  `;
}

export function createSavestoriesButtonHTML() {
  return `
    <button id="stories-detail-save" class="btn btn-transparent">
      Save Stories <i class="far fa-bookmark"></i>
    </button>
  `;
}

export function createRemovestoriesButtonHTML() {
  return `
    <button id="stories-detail-remove" class="btn btn-transparent">
      Remove Stories <i class="fas fa-bookmark"></i>
    </button>
  `;
}
