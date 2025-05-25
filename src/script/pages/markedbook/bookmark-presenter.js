import { storyMapper, getPlaceNameByCoordinate  } from '../../data/api-map';

export default class BookmarkPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async initialGalleryAndMap() {
    this.#view.showStoriesListLoading();

    try {
      const listOfStories = await this.#model.getAllStories();
      const stories = await Promise.all(listOfStories.map(storyMapper));

      const message = 'Berhasil mendapatkan daftar cerita tersimpan.';
      this.#view.populateMarkedbookStories(message, stories); 
    } catch (error) {
      console.error('initialGalleryAndMap: error:', error);
      this.#view.populateMarkedbookStoriesError(error.message); 
    } finally {
      this.#view.hideStoriesListLoading();
    }
  }


}
