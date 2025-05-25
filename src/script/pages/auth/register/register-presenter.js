export default class RegisterPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async registerUser({ name, email, password }) {
    this.#view.showSubmitLoadingButton();
    try {
      const response = await this.#model.registerUser({ name, email, password });

      if (!response || !response.ok) {
        const message = response?.message || 'Pendaftaran gagal. Coba lagi.';
        console.error('registerUser: response error:', response);
        this.#view.registeredFailed(message);
        return;
      }

      this.#view.registeredSuccessfully(response.message, response.data);
    } catch (error) {
      const errorMessage = error?.message || 'Terjadi kesalahan saat proses pendaftaran.';
      console.error('registerUser: exception:', error);
      this.#view.registeredFailed(errorMessage);
    } finally {
      this.#view.hideSubmitLoadingButton();
    }
  }
}
