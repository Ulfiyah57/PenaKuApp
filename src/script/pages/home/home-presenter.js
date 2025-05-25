export default class HomePresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  /**
   * Menampilkan peta laporan kerusakan dengan indikator loading.
   */
  async displaystoriesDetail() {
    try {
      await this.#view.initialMap();
    } catch (error) {
      console.error('displaystoriesDetail: Terjadi kesalahan saat menampilkan peta:', error);
    } finally {
      this.#view.hideLoading();
    }
  }

  /**
   * Inisialisasi halaman: memuat peta dan daftar cerita.
   */
  async initializestoriessPage() {
    try {
      // Tampilkan peta terlebih dahulu
      await this.displaystoriesDetail();

      // Ambil semua laporan dari API
      const response = await this.#model.getAllStories();

      // Validasi respons berdasarkan struktur API
      if (response?.error === true || !Array.isArray(response?.listStory)) {
        console.error('initializestoriessPage: Gagal mengambil laporan:', response);
        this.#view.populatestoriessListError(response?.message || 'Gagal mengambil data laporan.');
        return;
      }

      // Tampilkan laporan jika berhasil
      this.#view.populatestoriessList(response.message, response.listStory);
    } catch (error) {
      console.error('initializestoriessPage: Error umum:', error);
      this.#view.populatestoriessListError(error.message || 'Terjadi kesalahan saat mengambil laporan.');
    } finally {
      this.#view.hideLoading();
    }
  }
}
