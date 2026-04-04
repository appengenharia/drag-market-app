(function () {
  var routes = {
    home: 'Home',
    categorias: 'Categorias',
    detalhe: 'Detalhe',
    anunciar: 'Anunciar',
    mensagens: 'Mensagens',
    perfil: 'Perfil'
  };

  var currentRoute = 'home';
  var viewCards = document.querySelectorAll('[data-view]');
  var navLinks = document.querySelectorAll('[data-route]');
  var promoBanner = document.querySelector('.promo-banner');

  function normalizeRoute(route) {
    return Object.prototype.hasOwnProperty.call(routes, route) ? route : 'home';
  }

  function updateView(route) {
    currentRoute = normalizeRoute(route);

    viewCards.forEach(function (card) {
      card.classList.toggle('is-visible', card.dataset.view === currentRoute);
    });

    navLinks.forEach(function (link) {
      var isCurrent = link.dataset.route === currentRoute;
      link.classList.toggle('is-current', isCurrent);
      if (link.classList.contains('nav-link')) {
        link.setAttribute('aria-current', isCurrent ? 'page' : 'false');
      }
    });
  }

  function syncHash(route) {
    var nextHash = '#' + normalizeRoute(route);
    if (window.location.hash !== nextHash) {
      window.location.hash = nextHash;
    }
  }

  function goTo(route) {
    updateView(route);
    syncHash(route);
  }

  function bindNavigation() {
    navLinks.forEach(function (button) {
      button.addEventListener('click', function () {
        goTo(button.dataset.route);
      });
    });
  }

  function bindCards() {
    document.querySelectorAll('.listing-card[data-route], .ghost-link[data-route], .search-bar[data-route], .category-pill[data-route]').forEach(function (item) {
      item.addEventListener('click', function () {
        goTo(item.dataset.route);
      });
    });

    if (promoBanner) {
      promoBanner.addEventListener('click', function () {
        goTo(promoBanner.dataset.route);
      });

      promoBanner.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          goTo(promoBanner.dataset.route);
        }
      });
    }
  }

  function bindBrowserNavigation() {
    window.addEventListener('hashchange', function () {
      updateView(window.location.hash.replace('#', ''));
    });
  }

  function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function (error) {
        console.warn('Falha ao registrar o service worker:', error);
      });
    });
  }

  function showFirebaseStatus() {
    if (!window.marketCarFirebase || !window.marketCarFirebase.isConfigured) {
      console.info('Firebase ainda nao configurado. V00 segue em modo estrutural.');
    }
  }

  function start() {
    bindNavigation();
    bindCards();
    bindBrowserNavigation();
    registerServiceWorker();
    showFirebaseStatus();

    var initialRoute = normalizeRoute(window.location.hash.replace('#', ''));
    updateView(initialRoute);
    syncHash(initialRoute);
  }

  document.addEventListener('DOMContentLoaded', start);
})();
