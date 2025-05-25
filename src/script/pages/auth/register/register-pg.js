import RegisterPresenter from './register-presenter';
import * as PenaKuAPI from '../../../data/api';

export default class RegisterPage {
  #presenter = null;

  async render() {
    return `
      <section class="register-container">
        <div class="form-register-container">
          <h1 class="register__title">Daftar akun</h1>

          <form id="form-register" class="form-register">
            <div class="form-control">
              <label for="name-input" class="register-form__name-title">Nama lengkap</label>
              <div class="register-form__title-container">
                <input id="name-input" type="text" name="name" placeholder="Masukkan nama lengkap Anda">
              </div>
            </div>

            <div class="form-control">
              <label for="email-input" class="register-form__email-title">Email</label>
              <div class="register-form__title-container">
                <input id="email-input" type="email" name="email" placeholder="Contoh: nama@email.com">
              </div>
            </div>

            <div class="form-control">
              <label for="password-input" class="register-form__password-title">Password</label>
              <div class="register-form__title-container">
                <input id="password-input" type="password" name="password" placeholder="Masukkan password baru">
              </div>
            </div>

            <!-- Tambahkan elemen untuk menampilkan error -->
            <p id="form-error-message" class="error-message" style="color: red;"></p>

            <div class="form-buttons register-form__form-buttons">
              <div id="submit-button-container">
                <button class="btn" type="submit">Daftar akun</button>
              </div>
              <p class="register-form__already-have-account">Sudah punya akun? <a href="#/login">Masuk</a></p>
            </div>
          </form>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new RegisterPresenter({
      view: this,
      model: PenaKuAPI,
    });

    this.#setupForm();
  }

  #setupForm() {
    document.getElementById('form-register').addEventListener('submit', async (event) => {
      event.preventDefault();

      const data = {
        name: document.getElementById('name-input').value.trim(),
        email: document.getElementById('email-input').value.trim(),
        password: document.getElementById('password-input').value.trim(),
      };

      // Validasi sederhana
      if (!data.name || !data.email || !data.password) {
        this.registeredFailed('Wajib diisi semuanya.');
        return;
      }

      await this.#presenter.registerUser(data);
    });
  }

  registeredSuccessfully(message) {
    console.log(message);

    // Reset form sebelum redirect
    document.getElementById('form-register').reset();

    // Redirect
    location.hash = '/login';
  }

  registeredFailed(message) {
    const errorElement = document.getElementById('form-error-message');
    if (errorElement) {
      errorElement.textContent = message;
    } else {
      alert(message); // fallback
    }
  }

  showSubmitLoadingButton() {
    const form = document.getElementById('form-register');
    form.querySelectorAll('input, button').forEach((el) => (el.disabled = true));

    document.getElementById('submit-button-container').innerHTML = `
      <button class="btn" type="submit" disabled>
        <i class="fas fa-spinner loader-button"></i> Daftar akun
      </button>
    `;
  }

  hideSubmitLoadingButton() {
    const form = document.getElementById('form-register');
    form.querySelectorAll('input, button').forEach((el) => (el.disabled = false));

    document.getElementById('submit-button-container').innerHTML = `
      <button class="btn" type="submit">Daftar akun</button>
    `;
  }
}
