(function () {
  var routes = {
    home: 'Home',
    categorias: 'Categorias',
    detalhe: 'Detalhe',
    anunciar: 'Anunciar',
    mensagens: 'Mensagens',
    perfil: 'Perfil'
  };

  var storageKeys = {
    account: 'marketCarAccount',
    session: 'marketCarSession',
    drafts: 'marketCarDrafts'
  };

  var state = {
    currentRoute: 'home',
    authMode: 'login',
    account: null,
    user: null,
    drafts: []
  };

  var viewCards = document.querySelectorAll('[data-view]');
  var navLinks = document.querySelectorAll('[data-route]');
  var promoBanner = document.querySelector('.promo-banner');
  var authTabs = document.querySelectorAll('[data-auth-mode]');
  var authForms = document.querySelectorAll('[data-auth-form]');
  var authShortcuts = document.querySelectorAll('[data-auth-shortcut]');
  var loginForm = document.getElementById('login-form');
  var registerForm = document.getElementById('register-form');
  var authEntry = document.getElementById('auth-entry');
  var authStatus = document.getElementById('auth-status');
  var profileSummary = document.getElementById('profile-summary');
  var profileName = document.getElementById('profile-name');
  var profileMeta = document.getElementById('profile-meta');
  var profileStatus = document.getElementById('profile-status');
  var profileContact = document.getElementById('profile-contact');
  var profileDrafts = document.getElementById('profile-drafts');
  var draftList = document.getElementById('draft-list');
  var logoutButton = document.getElementById('logout-button');
  var announceGate = document.getElementById('announce-gate');
  var adForm = document.getElementById('ad-form');
  var adStatus = document.getElementById('ad-status');
  var clearAdFormButton = document.getElementById('clear-ad-form');
  var adContactName = document.getElementById('ad-contact-name');
  var adContactMeta = document.getElementById('ad-contact-meta');
  var adTitle = document.getElementById('ad-title');
  var adCategory = document.getElementById('ad-category');
  var adPrice = document.getElementById('ad-price');
  var adLocation = document.getElementById('ad-location');
  var adDescription = document.getElementById('ad-description');

  function normalizeRoute(route) {
    return Object.prototype.hasOwnProperty.call(routes, route) ? route : 'home';
  }

  function readStorage(key, fallback) {
    try {
      var rawValue = window.localStorage.getItem(key);
      return rawValue ? JSON.parse(rawValue) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function writeStorage(key, value) {
    window.localStorage.setItem(key, JSON.stringify(value));
  }

  function loadState() {
    state.account = readStorage(storageKeys.account, null);
    state.user = readStorage(storageKeys.session, null);
    state.drafts = readStorage(storageKeys.drafts, []);
  }

  function persistAccount(account) {
    state.account = account;
    writeStorage(storageKeys.account, account);
  }

  function persistSession(user) {
    state.user = user;
    writeStorage(storageKeys.session, user);
  }

  function persistDrafts(drafts) {
    state.drafts = drafts;
    writeStorage(storageKeys.drafts, drafts);
  }

  function setStatus(element, message, type) {
    if (!element) {
      return;
    }

    element.textContent = message;
    element.classList.remove('is-success', 'is-error');

    if (type) {
      element.classList.add(type === 'error' ? 'is-error' : 'is-success');
    }
  }

  function formatDraftCount(count) {
    if (count === 1) {
      return '1 rascunho';
    }

    return count + ' rascunhos';
  }

  function setAuthMode(mode) {
    state.authMode = mode === 'register' ? 'register' : 'login';

    authTabs.forEach(function (tab) {
      var isActive = tab.dataset.authMode === state.authMode;
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    authForms.forEach(function (form) {
      var isVisible = form.dataset.authForm === state.authMode;
      form.classList.toggle('is-visible', isVisible);
      form.hidden = !isVisible;
    });
  }

  function populateAdFormFromLatestDraft() {
    if (!adForm) {
      return;
    }

    var latestDraft = state.drafts[0];

    if (!latestDraft) {
      adForm.reset();
      return;
    }

    adTitle.value = latestDraft.title;
    adCategory.value = latestDraft.category;
    adPrice.value = latestDraft.price;
    adLocation.value = latestDraft.location;
    adDescription.value = latestDraft.description;
  }

  function renderDraftList() {
    if (!draftList) {
      return;
    }

    if (!state.drafts.length) {
      draftList.innerHTML = '<article class="draft-card empty-state"><p class="section-label">Rascunhos</p><h4>Nenhum rascunho salvo</h4><p class="panel-copy">Assim que voce salvar um anuncio inicial, ele aparece aqui para continuar depois.</p></article>';
      return;
    }

    draftList.innerHTML = state.drafts
      .slice(0, 3)
      .map(function (draft) {
        return (
          '<article class="draft-card">' +
          '<p class="section-label">Rascunho salvo</p>' +
          '<h4>' + draft.title + '</h4>' +
          '<p class="panel-copy">' + draft.category + ' | ' + draft.location + '</p>' +
          '<div class="listing-footer">' +
          '<strong class="price-tag">' + draft.price + '</strong>' +
          '<span class="listing-badge">Local</span>' +
          '</div>' +
          '</article>'
        );
      })
      .join('');
  }

  function renderProfile() {
    var isLoggedIn = Boolean(state.user);

    if (authEntry) {
      authEntry.hidden = isLoggedIn;
    }

    if (profileSummary) {
      profileSummary.hidden = !isLoggedIn;
    }

    if (!isLoggedIn) {
      return;
    }

    profileName.textContent = state.user.name;
    profileMeta.textContent = state.user.email;
    profileStatus.textContent = 'Logado localmente';
    profileContact.textContent = state.user.email;
    profileDrafts.textContent = formatDraftCount(state.drafts.length);
    renderDraftList();
  }

  function renderAnnounce() {
    var isLoggedIn = Boolean(state.user);

    if (announceGate) {
      announceGate.hidden = isLoggedIn;
    }

    if (adForm) {
      adForm.hidden = !isLoggedIn;
    }

    if (!isLoggedIn) {
      setStatus(adStatus, 'Entre ou crie sua conta para montar o primeiro rascunho de anuncio.', '');
      return;
    }

    adContactName.textContent = state.user.name;
    adContactMeta.textContent = 'Contato local: ' + state.user.email;
    populateAdFormFromLatestDraft();
    setStatus(adStatus, 'Seu rascunho pode ser salvo localmente nesta etapa e depois migrado para Firestore.', '');
  }

  function renderInterface() {
    renderProfile();
    renderAnnounce();
  }

  function updateView(route) {
    state.currentRoute = normalizeRoute(route);

    viewCards.forEach(function (card) {
      card.classList.toggle('is-visible', card.dataset.view === state.currentRoute);
    });

    navLinks.forEach(function (link) {
      var isCurrent = link.dataset.route === state.currentRoute;
      link.classList.toggle('is-current', isCurrent);
      if (link.classList.contains('nav-link')) {
        link.setAttribute('aria-current', isCurrent ? 'page' : 'false');
      }
    });

    renderInterface();
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
    document.querySelectorAll('.listing-card[data-route], .ghost-link[data-route], .search-bar[data-route], .category-pill[data-route], .primary-button[data-route], .ghost-button[data-route]').forEach(function (item) {
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

  function bindAuthSwitch() {
    authTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        setAuthMode(tab.dataset.authMode);
      });
    });

    authShortcuts.forEach(function (button) {
      button.addEventListener('click', function () {
        setAuthMode(button.dataset.authShortcut);
        goTo('perfil');
      });
    });
  }

  function bindAuthForms() {
    if (loginForm) {
      loginForm.addEventListener('submit', function (event) {
        event.preventDefault();

        var email = document.getElementById('login-email').value.trim().toLowerCase();
        var savedAccount = readStorage(storageKeys.account, null);

        if (!savedAccount) {
          setStatus(authStatus, 'Nenhuma conta local encontrada. Crie sua conta primeiro.', 'error');
          setAuthMode('register');
          return;
        }

        if (savedAccount.email !== email) {
          setStatus(authStatus, 'Esse e-mail nao corresponde a conta salva localmente.', 'error');
          return;
        }

        persistSession(savedAccount);
        setStatus(authStatus, 'Entrada concluida. Seu perfil esta pronto para anunciar.', 'success');
        renderInterface();
      });
    }

    if (registerForm) {
      registerForm.addEventListener('submit', function (event) {
        event.preventDefault();

        var account = {
          name: document.getElementById('register-name').value.trim(),
          email: document.getElementById('register-email').value.trim().toLowerCase(),
          createdAt: new Date().toISOString()
        };

        if (!account.name || !account.email) {
          setStatus(authStatus, 'Preencha nome e e-mail para criar sua conta.', 'error');
          return;
        }

        persistAccount(account);
        persistSession(account);
        setStatus(authStatus, 'Conta criada com sucesso. Voce ja pode montar seu anuncio.', 'success');
        renderInterface();
        goTo('perfil');
      });
    }
  }

  function bindProfileActions() {
    if (!logoutButton) {
      return;
    }

    logoutButton.addEventListener('click', function () {
      window.localStorage.removeItem(storageKeys.session);
      state.user = null;
      setAuthMode('login');
      setStatus(authStatus, 'Sessao encerrada. Voce pode entrar novamente quando quiser.', '');
      renderInterface();
    });
  }

  function bindAdForm() {
    if (adForm) {
      adForm.addEventListener('submit', function (event) {
        event.preventDefault();

        if (!state.user) {
          setStatus(adStatus, 'Entre na sua conta para salvar um rascunho.', 'error');
          goTo('perfil');
          return;
        }

        var draft = {
          id: Date.now(),
          title: adTitle.value.trim(),
          category: adCategory.value,
          price: adPrice.value.trim(),
          location: adLocation.value.trim(),
          description: adDescription.value.trim(),
          createdAt: new Date().toISOString()
        };

        if (!draft.title || !draft.category || !draft.price || !draft.location || !draft.description) {
          setStatus(adStatus, 'Preencha os campos principais do anuncio antes de salvar.', 'error');
          return;
        }

        persistDrafts([draft].concat(state.drafts).slice(0, 6));
        setStatus(adStatus, 'Rascunho salvo na V01. Proxima etapa: publicar e conectar com Firestore.', 'success');
        renderInterface();
      });
    }

    if (clearAdFormButton) {
      clearAdFormButton.addEventListener('click', function () {
        adForm.reset();
        setStatus(adStatus, 'Formulario limpo. Monte um novo rascunho quando quiser.', '');
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
      console.info('Firebase Auth e Firestore ainda nao configurados. V01 segue em modo local.');
    }
  }

  function start() {
    loadState();
    setAuthMode('login');
    bindNavigation();
    bindCards();
    bindAuthSwitch();
    bindAuthForms();
    bindProfileActions();
    bindAdForm();
    bindBrowserNavigation();
    registerServiceWorker();
    showFirebaseStatus();

    var initialRoute = normalizeRoute(window.location.hash.replace('#', ''));
    updateView(initialRoute);
    syncHash(initialRoute);
  }

  document.addEventListener('DOMContentLoaded', start);
})();
