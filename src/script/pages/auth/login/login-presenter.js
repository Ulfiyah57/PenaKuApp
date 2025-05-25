export default class LoginPresenter {
  #view;
  #model;
  #authModel;

  constructor({ view, model, authModel }) {
    this.#view = view;
    this.#model = model;
    this.#authModel = authModel;
  }

  async getLogin({ email, password }) {
    this.#view.showSubmitLoadingButton();

    try {
      // Validasi input
      if (!email || !password) {
        throw new Error('Email dan password harus diisi');
      }

      // Panggil API
      const response = await this.#model.getLogin({ email, password });

      // Handle response error
      if (response?.error || !response?.loginResult?.token) {
        const errorMessage = response?.message || 'Token tidak ditemukan dalam response';
        throw new Error(errorMessage);
      }

      // Simpan token dan redirect
      this.#authModel.storeAccessToken(response.loginResult.token);
      this.#view.loginSuccessfully(response.message, response.loginResult);

    } catch (error) {
      console.error('Login error:', error);
      this.#view.loginFailed(error.message || 'Terjadi kesalahan. Coba lagi.');
    } finally {
      this.#view.hideSubmitLoadingButton();
    }
  }
}