import { getActiveRoute } from '../routes/url-parser';
import {
  createstoriesItemHTML,
  createstoriessErrorHTML,
  createLoaderAbsoluteHTML,
  createAuthenticatedNavigationListHTML,
  createMainNavigationListHTML,
  createSubscribeButtonHTML,
  createUnauthenticatedNavigationListHTML,
  createUnsubscribeButtonHTML,
} from '../templates';
import { isServiceWorkerAvailable } from '../utils/index';
import { enableSkipToContent, handleViewTransition } from '../utils';
import { fetchAccessToken, logoutUser } from '../utils/auth';
import { routes } from '../routes/routes';
import { handlePushSubscribe, handlePushUnsubscribe, isPushSubscribed } from '../utils/notif-helper';

export default class App {
  #content;
  #drawerButton;
  #drawerNavigation;
  #skipLinkButton;

  constructor({ content, drawerNavigation, drawerButton, skipLinkButton, setupPushNotification }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#drawerNavigation = drawerNavigation;
    this.#skipLinkButton = skipLinkButton;

    this._currentPage = null;

    this.#init();
  }

  #init() {
    enableSkipToContent(this.#skipLinkButton, this.#content);
    this.#setupDrawer();
  }

  #setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      this.#drawerNavigation.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      const isTargetInsideDrawer = this.#drawerNavigation.contains(event.target);
      const isTargetInsideButton = this.#drawerButton.contains(event.target);

      if (!(isTargetInsideDrawer || isTargetInsideButton)) {
        this.#drawerNavigation.classList.remove('open');
      }

      this.#drawerNavigation.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#drawerNavigation.classList.remove('open');
        }
      });
    });
  }

  #setupNavigationList() {
    const isLogin = !!fetchAccessToken();
    const navListMain = this.#drawerNavigation.children.namedItem('main-menu');
    const navList = this.#drawerNavigation.children.namedItem('secondary-menu');

    // User not log in
    if (!isLogin) {
      navListMain.innerHTML = '';
      navList.innerHTML = createUnauthenticatedNavigationListHTML();
      return;
    }

    navListMain.innerHTML = createMainNavigationListHTML();
    navList.innerHTML = createAuthenticatedNavigationListHTML();

    const logoutButton = document.getElementById('logout-button');
    logoutButton.addEventListener('click', (event) => {
      event.preventDefault();

      if (confirm('Apakah Anda yakin ingin keluar?')) {
        logoutUser();

        // Redirect
        location.hash = '/login';
      }
    });
  }

async #setupPushNotification() {
  const pushNotificationTools = document.getElementById('push-notification-tools');
  const isSubscribed = await isPushSubscribed();

  if (isSubscribed) {
    pushNotificationTools.innerHTML = createUnsubscribeButtonHTML();

    document.getElementById('unsubscribe-button').addEventListener('click', () => {
      handlePushUnsubscribe().finally(() => {
        this.#setupPushNotification();
      });
    });

    return;
  }

  pushNotificationTools.innerHTML = createSubscribeButtonHTML();
  document.getElementById('subscribe-button').addEventListener('click', () => {
    handlePushSubscribe().finally(() => {
      this.#setupPushNotification();
    });
  });
}


async renderPage() {
    const url = getActiveRoute();
    const route = routes[url];

    // Destroy halaman sebelumnya
    if (this._currentPage?.destroy) {
      this._currentPage.destroy();
    }

    // Get page instance
    const page = route();
    this._currentPage = page;

    const transition = handleViewTransition({
      updateDOM: async () => {
        this.#content.innerHTML = await page.render();
        page.afterRender?.();
      },
    });

    transition.ready.catch(console.error);
    transition.updateCallbackDone.then(() => {
      scrollTo({ top: 0, behavior: 'instant' });
      this.#setupNavigationList();
 
      if (isServiceWorkerAvailable()) {
        this.#setupPushNotification();
      }
    });
  }
} 
