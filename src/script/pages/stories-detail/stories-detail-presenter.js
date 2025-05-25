import { storyMapper } from '../../data/api-map';

export default class storyDetailPresenter {
  #storiesId;
  #view;
  #api;
  #db;

  constructor(storiesId, { view, apiModel, dbModel }) {
    this.#storiesId = storiesId;
    this.#view = view;
    this.#api = apiModel;
    this.#db = dbModel;
  }

async displaystoriesDetail() {
  this.#view.showMapLoading();
  try {
    await this.#view.initialMap();
  } catch (error) {
    console.error('displaystoriesDetail error:', error);
  } finally {
    this.#view.hideMapLoading(); // BUKAN hideDetailLoading
  }
}

  async displaystoriesDetails() {
    this.#view.showDetailLoading();
    try {
      console.log(this.#storiesId);
      
      const response = await this.#api.getStoryDetail(this.#storiesId);


      if (response.error) {
        console.error('displaystoriesDetails error:', response);
        this.#view.renderstoriesDetailError(response.message);
        return;
      }

      this.#view.loadstoriesDetailAndMap(response.message, response.story);
    } catch (error) {
      console.error('displaystoriesDetails fetch error:', error);
      this.#view.renderstoriesDetailError(error.message);
    } finally {
      this.#view.hideDetailLoading();
    }
  }

async #isStoriesSaved() {
  const story = await this.#db.getStoryDetail(this.#storiesId);
  return !!story;
}

async saveStories() {
  try {
    // Ambil detail cerita dari API
    const response = await this.#api.getStoryDetail(this.#storiesId);

    if (response.error) {
      console.error('saveStories error from API:', response);
      this.#view.saveToBookmarkFailed(response.message);
      return;
    }

    const storyData = response.story;

    // Simpan ke database lokal
    await this.#db.putStory(storyData);

    // Tampilkan tombol remove dan pesan sukses
    this.#view.saveToBookmarkSuccessfully('Success saving story to bookmark');
    this.#view.renderRemoveButton();

  } catch (error) {
    console.error('saveStories: error:', error);
    this.#view.saveToBookmarkFailed(error.message);
  }
}

async displaySaveButton() {
  const isSaved = await this.#isStoriesSaved();
  if (isSaved) {
    this.#view.renderRemoveButton();
    return;
  }
  this.#view.renderSaveButton();
}

async removeStories() {
  try {
    await this.#db.removeStories(this.#storiesId);
    this.#view.removeFromBookmarkSuccessfully('Success to remove from bookmark');
    this.#view.renderSaveButton();
  } catch (error) {
    console.error('removeStories: error:', error);
    this.#view.removeFromBookmarkFailed(error.message);
  }
}

  async sendstoriesNotification() {
  try {
    const result = await this.#api.sendstoriesToMeViaNotification(this.#storiesId);
    if (!result.ok) {
      console.error('sendstoriesNotification: Failed response:', result);
      return;
    }
      console.log('sendstoriesNotification: Success message:', result.message);
    } catch (err) {
      console.error('sendstoriesNotification: Exception occurred:', err);
    }
  }
}


