(function () {
  var routes = {
    home: 'Home',
    categorias: 'Categorias',
    detalhe: 'Detalhe',
    anunciar: 'Anunciar',
    mensagens: 'Mensagens',
    perfil: 'Perfil',
    planos: 'Planos'
  };

  var storageKeys = {
    account: 'marketCarAccount',
    session: 'marketCarSession',
    drafts: 'marketCarDrafts'
  };

  var state = {
    currentRoute: 'home',
    currentCategory: 'Todos',
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
  var registerPhone = document.getElementById('register-phone');
  var authEntry = document.getElementById('auth-entry');
  var authStatus = document.getElementById('auth-status');
  var profileSummary = document.getElementById('profile-summary');
  var profileName = document.getElementById('profile-name');
  var profileMeta = document.getElementById('profile-meta');
  var profileStatus = document.getElementById('profile-status');
  var profileContact = document.getElementById('profile-contact');
  var profilePlan = document.getElementById('profile-plan');
  var profileDrafts = document.getElementById('profile-drafts');
  var draftList = document.getElementById('draft-list');
  var logoutButton = document.getElementById('logout-button');
  var activateSellerButton = document.getElementById('activate-seller-button');
  var goAdButton = document.getElementById('go-ad-button');
  var planButtons = document.querySelectorAll('[data-plan-select]');
  var planCards = document.querySelectorAll('[data-plan-card]');
  var sellerPlanStatus = document.getElementById('seller-plan-status');
  var announceGate = document.getElementById('announce-gate');
  var announceGateLabel = document.getElementById('announce-gate-label');
  var announceGateTitle = document.getElementById('announce-gate-title');
  var announceGateCopy = document.getElementById('announce-gate-copy');
  var announcePrimaryAction = document.getElementById('announce-primary-action');
  var announceSecondaryAction = document.getElementById('announce-secondary-action');
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
  var categoryPills = document.querySelectorAll('.category-pill[data-category]');
  var catalogLinks = document.querySelectorAll('.catalog-link[data-category]');
  var catalogCards = document.querySelectorAll('.catalog-card[data-category]');
  var catalogTitle = document.getElementById('catalog-title');
  var catalogDescription = document.getElementById('catalog-description');

  function normalizeRoute(route) {
    return Object.prototype.hasOwnProperty.call(routes, route) ? route : 'home';
  }

  function normalizeCategory(category) {
    if (!category) {
      return 'todos';
    }

    return String(category).trim().toLowerCase();
  }

  function getCategoryLabel(category) {
    var normalizedCategory = normalizeCategory(category);
    var categorySource = Array.prototype.slice.call(catalogLinks).find(function (button) {
      return normalizeCategory(button.dataset.category) === normalizedCategory;
    });

    return categorySource ? categorySource.textContent.trim() : 'Todos';
  }

  function setCurrentCategory(category) {
    state.currentCategory = getCategoryLabel(category);
  }

  function normalizeAccount(account) {
    if (!account) {
      return null;
    }

    var sellerActive = Boolean(account.sellerActive || account.sellerPlan);
    var sellerPlan = sellerActive ? account.sellerPlan || 'mensal' : '';

    return {
      name: account.name || '',
      email: (account.email || '').trim().toLowerCase(),
      phone: account.phone || '',
      sellerActive: sellerActive,
      sellerPlan: sellerPlan,
      role: sellerActive ? 'comprador-vendedor' : 'comprador',
      createdAt: account.createdAt || new Date().toISOString(),
      sellerActivatedAt: account.sellerActivatedAt || ''
    };
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
    state.account = normalizeAccount(readStorage(storageKeys.account, null));
    state.user = normalizeAccount(readStorage(storageKeys.session, null));
    state.drafts = readStorage(storageKeys.drafts, []);
  }

  function persistAccount(account) {
    state.account = normalizeAccount(account);
    writeStorage(storageKeys.account, state.account);
  }

  function persistSession(user) {
    state.user = normalizeAccount(user);
    writeStorage(storageKeys.session, state.user);
  }

  function syncAccount(user) {
    persistAccount(user);
    persistSession(user);
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

  function formatPlanName(plan) {
    if (!plan) {
      return 'Nao ativo';
    }

    return plan.charAt(0).toUpperCase() + plan.slice(1);
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
    profileMeta.textContent = state.user.email + ' | ' + state.user.phone;
    profileStatus.textContent = state.user.sellerActive ? 'Comprador + vendedor' : 'Comprador';
    profileContact.textContent = state.user.phone;
    profilePlan.textContent = state.user.sellerActive ? formatPlanName(state.user.sellerPlan) : 'Nao ativo';
    profileDrafts.textContent = formatDraftCount(state.drafts.length);
    activateSellerButton.hidden = state.user.sellerActive;
    goAdButton.hidden = !state.user.sellerActive;
    renderDraftList();
  }

  function renderAnnounce() {
    var isLoggedIn = Boolean(state.user);
    var isSeller = isLoggedIn && state.user.sellerActive;

    if (announceGate) {
      announceGate.hidden = isSeller;
    }

    if (adForm) {
      adForm.hidden = !isSeller;
    }

    if (!isLoggedIn) {
      announceGateLabel.textContent = 'Conta necessaria';
      announceGateTitle.textContent = 'Entre ou crie sua conta para anunciar';
      announceGateCopy.textContent = 'Assim que sua conta local estiver pronta, voce ja consegue acessar a etapa inicial do anuncio.';
      announcePrimaryAction.textContent = 'Entrar para anunciar';
      announcePrimaryAction.dataset.route = 'perfil';
      announceSecondaryAction.hidden = false;
      announceSecondaryAction.textContent = 'Criar conta';
      announceSecondaryAction.dataset.authShortcut = 'register';
      setStatus(adStatus, 'Entre ou crie sua conta para montar o primeiro rascunho de anuncio.', '');
      return;
    }

    if (!isSeller) {
      announceGateLabel.textContent = 'Modo vendedor';
      announceGateTitle.textContent = 'Ative seu perfil de vendedor para anunciar';
      announceGateCopy.textContent = 'Sua conta ja esta pronta como comprador. Escolha um plano visual e libere a area de anuncios.';
      announcePrimaryAction.textContent = 'Quero vender';
      announcePrimaryAction.dataset.route = 'planos';
      announceSecondaryAction.hidden = true;
      setStatus(adStatus, 'Seu perfil atual e comprador. Ative um plano local para anunciar.', '');
      return;
    }

    adContactName.textContent = state.user.name;
    adContactMeta.textContent = 'Contato local: ' + state.user.email + ' | ' + state.user.phone;
    populateAdFormFromLatestDraft();
    setStatus(adStatus, 'Seu rascunho pode ser salvo localmente nesta etapa e depois migrado para Firestore.', '');
  }

  function renderPlans() {
    var isLoggedIn = Boolean(state.user);
    var currentPlan = isLoggedIn && state.user.sellerActive ? state.user.sellerPlan : '';

    planCards.forEach(function (card) {
      card.classList.toggle('is-active', card.dataset.planCard === currentPlan);
    });

    planButtons.forEach(function (button) {
      var isActivePlan = button.dataset.planSelect === currentPlan;
      button.disabled = !isLoggedIn;
      button.textContent = isActivePlan ? 'Plano ativo' : 'Ativar ' + formatPlanName(button.dataset.planSelect).toLowerCase();
    });

    if (!sellerPlanStatus) {
      return;
    }

    if (!isLoggedIn) {
      setStatus(sellerPlanStatus, 'Entre na sua conta para ativar o modo vendedor.', '');
      return;
    }

    if (state.user.sellerActive) {
      setStatus(sellerPlanStatus, 'Perfil vendedor ativo no plano ' + formatPlanName(state.user.sellerPlan) + '.', 'success');
      return;
    }

    setStatus(sellerPlanStatus, 'Escolha um plano para ativar localmente o modo vendedor. Sem pagamento real nesta etapa.', '');
  }

  function renderCatalog() {
    var activeCategory = normalizeCategory(state.currentCategory);
    var visibleCards = 0;

    categoryPills.forEach(function (button) {
      button.classList.toggle('is-active', normalizeCategory(button.dataset.category) === activeCategory);
    });

    catalogLinks.forEach(function (button) {
      var isActive = normalizeCategory(button.dataset.category) === activeCategory;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    catalogCards.forEach(function (card) {
      var shouldShow = activeCategory === 'todos' || normalizeCategory(card.dataset.category) === activeCategory;
      card.hidden = !shouldShow;

      if (shouldShow) {
        visibleCards += 1;
      }
    });

    if (catalogTitle) {
      catalogTitle.textContent = activeCategory === 'todos'
        ? 'Pecas e projetos em destaque'
        : getCategoryLabel(state.currentCategory) + ' em destaque';
    }

    if (catalogDescription) {
      catalogDescription.textContent = activeCategory === 'todos'
        ? 'Grade pensada para comparar imagem, preco e resumo do produto rapidamente.'
        : 'Exibindo anuncios de ' + getCategoryLabel(state.currentCategory).toLowerCase() + ' com leitura rapida de imagem, preco e resumo.';
    }

    if (!visibleCards && catalogDescription) {
      catalogDescription.textContent = 'Ainda nao existem anuncios mockados para essa categoria na V01.';
    }
  }

  function renderInterface() {
    renderCatalog();
    renderProfile();
    renderAnnounce();
    renderPlans();
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
        if (button.dataset.category) {
          setCurrentCategory(button.dataset.category);
        }

        goTo(button.dataset.route);
      });
    });
  }

  function bindCards() {
    if (promoBanner) {
      promoBanner.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          if (promoBanner.dataset.category) {
            setCurrentCategory(promoBanner.dataset.category);
          }
          goTo(promoBanner.dataset.route);
        }
      });
    }
  }

  function bindCategoryFilters() {
    catalogLinks.forEach(function (button) {
      button.addEventListener('click', function () {
        setCurrentCategory(button.dataset.category);
        renderCatalog();
      });
    });
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
        setStatus(authStatus, 'Entrada concluida. Sua conta local foi carregada.', 'success');
        renderInterface();
      });
    }

    if (registerForm) {
      registerForm.addEventListener('submit', function (event) {
        event.preventDefault();

        var account = {
          name: document.getElementById('register-name').value.trim(),
          email: document.getElementById('register-email').value.trim().toLowerCase(),
          phone: registerPhone.value.trim(),
          sellerActive: false,
          sellerPlan: '',
          createdAt: new Date().toISOString()
        };

        if (!account.name || !account.email || !account.phone) {
          setStatus(authStatus, 'Preencha nome, e-mail e telefone para criar sua conta.', 'error');
          return;
        }

        syncAccount(account);
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

  function bindPlanButtons() {
    planButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        if (!state.user) {
          goTo('perfil');
          setStatus(sellerPlanStatus, 'Entre na conta para ativar um plano.', 'error');
          return;
        }

        var updatedUser = normalizeAccount({
          name: state.user.name,
          email: state.user.email,
          phone: state.user.phone,
          sellerActive: true,
          sellerPlan: button.dataset.planSelect,
          sellerActivatedAt: new Date().toISOString(),
          createdAt: state.user.createdAt
        });

        syncAccount(updatedUser);
        setStatus(sellerPlanStatus, 'Plano ' + button.dataset.planSelect + ' ativado localmente. Seu modo vendedor ja esta liberado.', 'success');
        renderInterface();
        goTo('perfil');
      });
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

        if (!state.user.sellerActive) {
          setStatus(adStatus, 'Ative o modo vendedor antes de salvar um anuncio.', 'error');
          goTo('planos');
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
    bindCategoryFilters();
    bindAuthSwitch();
    bindAuthForms();
    bindProfileActions();
    bindPlanButtons();
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
