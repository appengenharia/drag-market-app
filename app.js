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
    drafts: 'marketCarDrafts',
    legalAccepted: 'accepted_terms',
    adminOverride: 'marketCarAdminOverride'
  };

  // TODO(V02+): substituir DEFAULT_ADMIN/marketCarAdminOverride por Firebase Auth
  // com o usuario admin criado no Auth e o campo isAdmin: true na colecao users do Firestore.
  var DEFAULT_ADMIN = {
    email: 'admim@admim',
    password: 'admim',
    name: 'Administrador',
    isAdmin: true,
    createdAt: 'built-in'
  };

  var state = {
    currentRoute: 'home',
    currentCategory: 'Todos',
    currentSearch: '',
    authMode: 'login',
    account: null,
    user: null,
    drafts: [],
    legalAccepted: false,
    pendingAction: null,
    authPanelOpen: false,
    adminOverride: null
  };

  var viewCards = document.querySelectorAll('[data-view]');
  var navLinks = document.querySelectorAll('[data-route]');
  var updateBanner = document.getElementById('update-banner');
  var updateMessage = document.getElementById('update-message');
  var updateNowButton = document.getElementById('update-now-button');
  var promoBanner = document.querySelector('.promo-banner');
  var authTabs = document.querySelectorAll('[data-auth-mode]');
  var authForms = document.querySelectorAll('[data-auth-form]');
  var authShortcuts = document.querySelectorAll('[data-auth-shortcut]');
  var loginForm = document.getElementById('login-form');
  var loginPassword = document.getElementById('login-password');
  var registerForm = document.getElementById('register-form');
  var registerPhone = document.getElementById('register-phone');
  var registerPassword = document.getElementById('register-password');
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
  var detailContactButton = document.getElementById('detail-contact-button');
  var detailContactStatus = document.getElementById('detail-contact-status');
  var categoryPills = document.querySelectorAll('.category-pill[data-category]');
  var catalogLinks = document.querySelectorAll('.catalog-link[data-category]');
  var catalogCards = document.querySelectorAll('.catalog-card[data-category]');
  var catalogTitle = document.getElementById('catalog-title');
  var catalogDescription = document.getElementById('catalog-description');
  var catalogSearchInput = document.getElementById('catalog-search-input');
  var catalogMatchTitle = document.getElementById('catalog-match-title');
  var catalogMatchCopy = document.getElementById('catalog-match-copy');
  var catalogMatchList = document.getElementById('catalog-match-list');
  var quickAuthPanel = document.getElementById('quick-auth-panel');
  var quickAuthHandle = document.getElementById('quick-auth-handle');
  var quickAuthMobileTrigger = document.getElementById('quick-auth-mobile-trigger');
  var quickAuthBackdrop = document.getElementById('quick-auth-backdrop');
  var quickAuthClose = document.getElementById('quick-auth-close');
  var quickAuthGuest = document.getElementById('quick-auth-guest');
  var quickAuthUser = document.getElementById('quick-auth-user');
  var quickLoginForm = document.getElementById('quick-login-form');
  var quickLoginEmail = document.getElementById('quick-login-email');
  var quickLoginPassword = document.getElementById('quick-login-password');
  var quickAuthStatus = document.getElementById('quick-auth-status');
  var quickForgotPassword = document.getElementById('quick-forgot-password');
  var quickUserName = document.getElementById('quick-user-name');
  var quickUserMeta = document.getElementById('quick-user-meta');
  var quickLogoutButton = document.getElementById('quick-logout-button');
  var legalBanner = document.getElementById('legal-banner');
  var acceptLegalButton = document.getElementById('accept-legal-button');
  var adminPanel = document.getElementById('admin-panel');
  var adminDefaultWarning = document.getElementById('admin-default-warning');
  var adminSettingsForm = document.getElementById('admin-settings-form');
  var adminDisplayName = document.getElementById('admin-display-name');
  var adminNewPassword = document.getElementById('admin-new-password');
  var adminConfirmPassword = document.getElementById('admin-confirm-password');
  var adminSettingsStatus = document.getElementById('admin-settings-status');
  var adminResetButton = document.getElementById('admin-reset-button');
  var updateBannerTimer = 0;
  var activeServiceWorkerRegistration = null;
  var isReloadingForUpdate = false;

  function normalizeRoute(route) {
    return Object.prototype.hasOwnProperty.call(routes, route) ? route : 'home';
  }

  function normalizeCategory(category) {
    if (!category) {
      return 'todos';
    }

    return String(category).trim().toLowerCase();
  }

  function normalizeText(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();
  }

  function normalizeAdminOverride(override) {
    if (!override || typeof override !== 'object') {
      return null;
    }

    if (!override.name || !override.password) {
      return null;
    }

    return {
      name: String(override.name).trim(),
      password: String(override.password),
      changedAt: override.changedAt || ''
    };
  }

  function getAdminCredentials() {
    var override = normalizeAdminOverride(state.adminOverride);

    return {
      email: DEFAULT_ADMIN.email,
      password: override ? override.password : DEFAULT_ADMIN.password,
      name: override ? override.name : DEFAULT_ADMIN.name,
      isAdmin: true,
      createdAt: DEFAULT_ADMIN.createdAt,
      changedAt: override ? override.changedAt : ''
    };
  }

  function isDefaultAdminCredentials() {
    return !normalizeAdminOverride(state.adminOverride);
  }

  function buildAdminSessionUser() {
    var adminCredentials = getAdminCredentials();

    return normalizeAccount({
      name: adminCredentials.name,
      email: adminCredentials.email,
      phone: 'Painel ADM',
      sellerActive: false,
      sellerPlan: '',
      isAdmin: true,
      role: 'admin',
      createdAt: adminCredentials.createdAt
    });
  }

  function canUseSecureAuth() {
    return Boolean(window.crypto && window.crypto.subtle && window.crypto.getRandomValues);
  }

  function bytesToHex(buffer) {
    return Array.prototype.map.call(new Uint8Array(buffer), function (byte) {
      return byte.toString(16).padStart(2, '0');
    }).join('');
  }

  function createSalt() {
    var values = new Uint8Array(16);
    window.crypto.getRandomValues(values);
    return bytesToHex(values);
  }

  function hasLocalPassword(account) {
    return Boolean(account && account.passwordSalt && account.passwordHash);
  }

  async function createPasswordHash(password, salt) {
    var encoder = new TextEncoder();
    var payload = encoder.encode(salt + ':' + password);
    var digest = await window.crypto.subtle.digest('SHA-256', payload);
    return bytesToHex(digest);
  }

  async function buildLocalCredentials(password) {
    var salt = createSalt();
    var hash = await createPasswordHash(password, salt);

    return {
      passwordSalt: salt,
      passwordHash: hash,
      authProvider: 'local-prototype',
      authPreparedFor: 'firebase-auth'
    };
  }

  async function verifyLocalPassword(account, password) {
    if (!hasLocalPassword(account)) {
      return false;
    }

    return createPasswordHash(password, account.passwordSalt).then(function (hash) {
      return hash === account.passwordHash;
    });
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

  function getCardTitle(card) {
    var titleElement = card.querySelector('h4');
    return titleElement ? titleElement.textContent.trim() : '';
  }

  function getSearchMatch(title, term) {
    var normalizedTitle = normalizeText(title);
    var normalizedTerm = normalizeText(term);
    var titleWords;
    var searchWords;
    var approximateMatch;

    if (!normalizedTerm) {
      return {
        isMatch: true,
        isExact: false
      };
    }

    if (normalizedTitle === normalizedTerm) {
      return {
        isMatch: true,
        isExact: true
      };
    }

    if (normalizedTitle.indexOf(normalizedTerm) !== -1) {
      return {
        isMatch: true,
        isExact: false
      };
    }

    titleWords = normalizedTitle.split(/\s+/);
    searchWords = normalizedTerm.split(/\s+/).filter(Boolean);
    approximateMatch = searchWords.every(function (word) {
      return titleWords.some(function (titleWord) {
        return titleWord.indexOf(word) !== -1 || word.indexOf(titleWord) !== -1;
      });
    });

    return {
      isMatch: approximateMatch,
      isExact: false
    };
  }

  function normalizeAccount(account) {
    if (!account) {
      return null;
    }

    var isAdmin = Boolean(account.isAdmin);
    var sellerActive = Boolean(account.sellerActive || account.sellerPlan);
    var sellerPlan = sellerActive ? account.sellerPlan || 'mensal' : '';

    return {
      name: account.name || '',
      email: (account.email || '').trim().toLowerCase(),
      phone: account.phone || '',
      isAdmin: isAdmin,
      sellerActive: sellerActive,
      sellerPlan: sellerPlan,
      role: isAdmin ? 'admin' : sellerActive ? 'comprador-vendedor' : 'comprador',
      createdAt: account.createdAt || new Date().toISOString(),
      sellerActivatedAt: account.sellerActivatedAt || '',
      passwordSalt: account.passwordSalt || '',
      passwordHash: account.passwordHash || '',
      authProvider: account.authProvider || 'local-prototype',
      authPreparedFor: account.authPreparedFor || 'firebase-auth'
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

  function readAcceptedTerms() {
    var currentValue = window.localStorage.getItem(storageKeys.legalAccepted);
    var legacyValue = window.localStorage.getItem('marketCarLegalAccepted');

    function isAcceptedValue(value) {
      return value === 'true' || value === '"true"';
    }

    return isAcceptedValue(currentValue) || isAcceptedValue(legacyValue);
  }

  function isMobileViewport() {
    return window.matchMedia('(max-width: 767px)').matches;
  }

  function setAuthPanelOpen(isOpen) {
    state.authPanelOpen = Boolean(isOpen);

    if (!quickAuthPanel) {
      return;
    }

    quickAuthPanel.classList.toggle('is-open', state.authPanelOpen);
    quickAuthPanel.setAttribute('aria-expanded', state.authPanelOpen ? 'true' : 'false');
    document.body.classList.toggle('auth-panel-open', state.authPanelOpen);

    if (quickAuthBackdrop) {
      quickAuthBackdrop.setAttribute('aria-hidden', state.authPanelOpen ? 'false' : 'true');
    }
  }

  function loadState() {
    state.adminOverride = normalizeAdminOverride(readStorage(storageKeys.adminOverride, null));
    state.account = normalizeAccount(readStorage(storageKeys.account, null));
    state.user = normalizeAccount(readStorage(storageKeys.session, null));
    state.drafts = readStorage(storageKeys.drafts, []);
    state.legalAccepted = readAcceptedTerms();

    if (state.user && state.user.isAdmin) {
      persistSession(buildAdminSessionUser());
    }
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
    element.dataset.hasMessage = message ? 'true' : '';
    element.classList.remove('is-success', 'is-error');

    if (type) {
      element.classList.add(type === 'error' ? 'is-error' : 'is-success');
    }
  }

  function focusQuickAuthPanel() {
    if (!quickAuthPanel || !quickLoginEmail) {
      return;
    }

    setAuthPanelOpen(true);

    window.setTimeout(function () {
      quickLoginEmail.focus();
    }, 50);
  }

  function promptQuickAuth(message, pendingAction) {
    state.pendingAction = pendingAction || null;
    setAuthMode('login');
    setStatus(quickAuthStatus, message, 'error');
    setStatus(authStatus, message, 'error');
    focusQuickAuthPanel();
  }

  function clearPendingAction() {
    state.pendingAction = null;
  }

  function performPendingAction() {
    if (!state.pendingAction) {
      return;
    }

    if (state.pendingAction.type === 'contact' && state.pendingAction.href) {
      window.open(state.pendingAction.href, '_blank', 'noopener,noreferrer');
      clearPendingAction();
      return;
    }

    if (state.pendingAction.type === 'route' && state.pendingAction.route) {
      var nextRoute = state.pendingAction.route;
      clearPendingAction();
      goTo(nextRoute);
      return;
    }

    clearPendingAction();
  }

  function logoutCurrentUser(message) {
    window.localStorage.removeItem(storageKeys.session);
    state.user = null;
    clearPendingAction();
    setAuthMode('login');
    setStatus(authStatus, message || 'Sessao encerrada. Voce pode entrar novamente quando quiser.', '');
    setStatus(quickAuthStatus, message || 'Sessao encerrada. Voce pode entrar novamente quando quiser.', '');
    renderInterface();
  }

  async function loginWithLocalCredentials(email, password) {
    var adminCredentials = getAdminCredentials();
    var savedAccount = readStorage(storageKeys.account, null);
    var normalizedEmail = email.trim().toLowerCase();
    var passwordValue = password.trim();
    var isAdminAttempt = normalizedEmail === adminCredentials.email;
    var passwordMatches = false;

    if (isAdminAttempt) {
      if (!passwordValue) {
        return {
          ok: false,
          message: 'Digite a senha do administrador para entrar.'
        };
      }

      if (passwordValue !== adminCredentials.password) {
        return {
          ok: false,
          message: 'Senha do administrador incorreta. Use a credencial ADM embutida no app.'
        };
      }

      persistSession(buildAdminSessionUser());
      return {
        ok: true,
        message: 'Entrada ADM concluida. Painel administrativo local liberado.'
      };
    }

    if (!savedAccount) {
      return {
        ok: false,
        message: 'Nenhuma conta local encontrada. Crie sua conta primeiro.'
      };
    }

    if ((savedAccount.email || '').trim().toLowerCase() !== normalizedEmail) {
      return {
        ok: false,
        message: 'Esse e-mail nao corresponde a conta salva localmente.'
      };
    }

    if (!passwordValue) {
      return {
        ok: false,
        message: 'Digite sua senha para entrar.'
      };
    }

    if (!canUseSecureAuth()) {
      return {
        ok: false,
        message: 'Seu navegador nao liberou a base de autenticacao local segura.'
      };
    }

    if (!hasLocalPassword(savedAccount)) {
      return {
        ok: false,
        message: 'Sua conta local ainda nao tem senha pronta. Recrie a conta para ativar a autenticacao local.'
      };
    }

    passwordMatches = await verifyLocalPassword(savedAccount, passwordValue);

    if (!passwordMatches) {
      return {
        ok: false,
        message: 'Senha incorreta para a conta local informada.'
      };
    }

    persistSession(savedAccount);

    return {
      ok: true,
      message: 'Entrada concluida. Sua conta local foi carregada.'
    };
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
      if (draftList) {
        draftList.hidden = false;
      }
      return;
    }

    if (state.user.isAdmin) {
      profileName.textContent = state.user.name;
      profileMeta.textContent = state.user.email + ' | acesso administrativo local';
      profileStatus.textContent = 'Administrador';
      profileContact.textContent = state.user.email;
      profilePlan.textContent = 'Painel ADM';
      profileDrafts.textContent = 'Sem anuncios';
      activateSellerButton.hidden = true;
      goAdButton.hidden = true;
      if (draftList) {
        draftList.hidden = true;
      }
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
    if (draftList) {
      draftList.hidden = false;
    }
    renderDraftList();
  }

  function renderAdminPanel() {
    var isAdmin = Boolean(state.user && state.user.isAdmin);

    if (adminPanel) {
      adminPanel.hidden = !isAdmin;
    }

    if (!isAdmin) {
      return;
    }

    if (adminDisplayName) {
      adminDisplayName.value = getAdminCredentials().name;
    }

    if (adminDefaultWarning) {
      adminDefaultWarning.hidden = !isDefaultAdminCredentials();
    }

    if (adminNewPassword) {
      adminNewPassword.value = '';
    }

    if (adminConfirmPassword) {
      adminConfirmPassword.value = '';
    }

    if (adminSettingsStatus) {
      setStatus(adminSettingsStatus, 'Esse mecanismo local e temporario e deve ser substituido por Firebase Auth nas proximas versoes.', '');
    }
  }

  function renderQuickAuthPanel() {
    var isLoggedIn = Boolean(state.user);

    if (quickAuthGuest) {
      quickAuthGuest.hidden = isLoggedIn;
    }

    if (quickAuthUser) {
      quickAuthUser.hidden = !isLoggedIn;
    }

    document.body.classList.toggle('is-authenticated', isLoggedIn);

    if (quickAuthMobileTrigger) {
      quickAuthMobileTrigger.textContent = isLoggedIn ? 'Conta' : 'Entrar';
    }

    if (!isLoggedIn) {
      return;
    }

    if (quickUserName) {
      quickUserName.textContent = state.user.name;
    }

    if (quickUserMeta) {
      quickUserMeta.textContent = state.user.isAdmin
        ? state.user.email + ' | administrador local de teste'
        : state.user.email + ' | pronto para futura integracao com Firebase Authentication';
    }
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

  function renderDetailAccess() {
    var isLoggedIn = Boolean(state.user);

    if (!detailContactButton) {
      return;
    }

    detailContactButton.textContent = isLoggedIn ? 'Contato via WhatsApp' : 'Entrar para falar com o vendedor';
    setStatus(
      detailContactStatus,
      isLoggedIn
        ? 'Contato liberado para a sua conta local. Fluxo pronto para migrar depois para Firebase Auth.'
        : 'Entre para liberar o contato com o vendedor.',
      isLoggedIn ? 'success' : ''
    );
  }

  function renderLegalBanner() {
    if (!legalBanner) {
      return;
    }

    legalBanner.hidden = state.legalAccepted;
    legalBanner.classList.toggle('is-hidden', state.legalAccepted);
    document.body.classList.toggle('has-legal-banner', !state.legalAccepted);
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

  function hideUpdateBanner() {
    if (!updateBanner) {
      return;
    }

    if (updateBannerTimer) {
      window.clearTimeout(updateBannerTimer);
      updateBannerTimer = 0;
    }

    updateBanner.classList.remove('is-visible');

    window.setTimeout(function () {
      if (!updateBanner.classList.contains('is-visible')) {
        updateBanner.hidden = true;
      }
    }, 260);
  }

  function showUpdateBanner(message) {
    if (!updateBanner) {
      return;
    }

    if (updateMessage) {
      updateMessage.textContent = message || '🔄 Nova versao disponivel';
    }

    if (updateBannerTimer) {
      window.clearTimeout(updateBannerTimer);
    }

    updateBanner.hidden = false;
    window.requestAnimationFrame(function () {
      updateBanner.classList.add('is-visible');
    });

    updateBannerTimer = window.setTimeout(function () {
      hideUpdateBanner();
    }, 15000);
  }

  function checkForUpdate(registration) {
    if (!registration) {
      return;
    }

    activeServiceWorkerRegistration = registration;

    if (registration.waiting) {
      showUpdateBanner('🔄 Nova versao disponivel');
    }

    registration.addEventListener('updatefound', function () {
      var installingWorker = registration.installing;

      if (!installingWorker) {
        return;
      }

      installingWorker.addEventListener('statechange', function () {
        if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
          showUpdateBanner('🔄 Nova versao disponivel');
        }
      });
    });
  }

  function renderCatalog() {
    var activeCategory = normalizeCategory(state.currentCategory);
    var visibleCards = 0;
    var searchTerm = normalizeText(state.currentSearch);
    var matchedTitles = [];
    var exactMatchTitle = '';

    categoryPills.forEach(function (button) {
      button.classList.toggle('is-active', normalizeCategory(button.dataset.category) === activeCategory);
    });

    catalogLinks.forEach(function (button) {
      var isActive = normalizeCategory(button.dataset.category) === activeCategory;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    catalogCards.forEach(function (card) {
      var title = getCardTitle(card);
      var categoryMatches = activeCategory === 'todos' || normalizeCategory(card.dataset.category) === activeCategory;
      var searchMatch = getSearchMatch(title, searchTerm);
      var shouldShow = categoryMatches && searchMatch.isMatch;
      card.hidden = !shouldShow;

      if (shouldShow) {
        visibleCards += 1;
        matchedTitles.push(title);
        if (!exactMatchTitle && searchMatch.isExact) {
          exactMatchTitle = title;
        }
      }
    });

    if (catalogSearchInput && catalogSearchInput.value !== state.currentSearch) {
      catalogSearchInput.value = state.currentSearch;
    }

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

    if (searchTerm && catalogDescription) {
      catalogDescription.textContent = visibleCards
        ? 'Busca ativa por "' + state.currentSearch + '" com ' + visibleCards + ' resultado(s) visivel(is) na grade.'
        : 'Nenhum anuncio encontrado para "' + state.currentSearch + '" nesta categoria.';
    } else if (!visibleCards && catalogDescription) {
      catalogDescription.textContent = 'Ainda nao existem anuncios mockados para essa categoria na V01.';
    }

    if (catalogMatchTitle) {
      if (!searchTerm) {
        catalogMatchTitle.textContent = 'Digite o nome da peca';
      } else if (exactMatchTitle) {
        catalogMatchTitle.textContent = exactMatchTitle;
      } else if (matchedTitles.length) {
        catalogMatchTitle.textContent = matchedTitles[0];
      } else {
        catalogMatchTitle.textContent = 'Nenhum nome encontrado';
      }
    }

    if (catalogMatchCopy) {
      if (!searchTerm) {
        catalogMatchCopy.textContent = 'O catalogo retorna aqui o nome exato ou aproximado encontrado na busca.';
      } else if (exactMatchTitle) {
        catalogMatchCopy.textContent = 'Resultado exato localizado no catalogo.';
      } else if (matchedTitles.length) {
        catalogMatchCopy.textContent = 'Resultado aproximado localizado pelo nome digitado.';
      } else {
        catalogMatchCopy.textContent = 'Tente outro nome ou remova filtros para ampliar a busca.';
      }
    }

    if (catalogMatchList) {
      if (!searchTerm || !matchedTitles.length) {
        catalogMatchList.innerHTML = '';
      } else {
        catalogMatchList.innerHTML = matchedTitles
          .slice(0, 3)
          .map(function (title) {
            return '<span class="catalog-match-chip">' + title + '</span>';
          })
          .join('');
      }
    }
  }

  function renderInterface() {
    renderCatalog();
    renderProfile();
    renderAdminPanel();
    renderQuickAuthPanel();
    renderAnnounce();
    renderDetailAccess();
    renderLegalBanner();
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
    var nextRoute = normalizeRoute(route);

    if (nextRoute === 'perfil') {
      setAuthPanelOpen(true);
    }

    if (nextRoute === 'anunciar' && !state.user) {
      promptQuickAuth('Entre para anunciar seus produtos.', {
        type: 'route',
        route: 'anunciar'
      });
      return;
    }

    updateView(nextRoute);
    syncHash(nextRoute);
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

  function bindCatalogSearch() {
    if (!catalogSearchInput) {
      return;
    }

    catalogSearchInput.addEventListener('input', function () {
      state.currentSearch = catalogSearchInput.value.trim();
      renderCatalog();
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
      loginForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        var loginResult = await loginWithLocalCredentials(
          document.getElementById('login-email').value,
          loginPassword ? loginPassword.value : ''
        );

        setStatus(authStatus, loginResult.message, loginResult.ok ? 'success' : 'error');
        setStatus(quickAuthStatus, loginResult.message, loginResult.ok ? 'success' : 'error');

        if (!loginResult.ok) {
          if (loginResult.message.indexOf('Crie sua conta') !== -1) {
            setAuthMode('register');
          }
          return;
        }

        if (isMobileViewport()) {
          setAuthPanelOpen(false);
        }

        renderInterface();
        performPendingAction();
      });
    }

    if (registerForm) {
      registerForm.addEventListener('submit', async function (event) {
        var credentials;
        event.preventDefault();

        if (!canUseSecureAuth()) {
          setStatus(authStatus, 'Seu navegador nao liberou a base local segura para criar senha.', 'error');
          return;
        }

        var account = {
          name: document.getElementById('register-name').value.trim(),
          email: document.getElementById('register-email').value.trim().toLowerCase(),
          phone: registerPhone.value.trim(),
          sellerActive: false,
          sellerPlan: '',
          createdAt: new Date().toISOString()
        };

        if (!account.name || !account.email || !account.phone || !registerPassword || !registerPassword.value.trim()) {
          setStatus(authStatus, 'Preencha nome, e-mail, telefone e senha para criar sua conta.', 'error');
          return;
        }

        credentials = await buildLocalCredentials(registerPassword.value.trim());
        syncAccount({
          name: account.name,
          email: account.email,
          phone: account.phone,
          sellerActive: account.sellerActive,
          sellerPlan: account.sellerPlan,
          createdAt: account.createdAt,
          passwordSalt: credentials.passwordSalt,
          passwordHash: credentials.passwordHash,
          authProvider: credentials.authProvider,
          authPreparedFor: credentials.authPreparedFor
        });

        setStatus(authStatus, 'Conta criada com sucesso. Sua senha local foi preparada sem salvar texto puro.', 'success');
        setStatus(quickAuthStatus, 'Conta criada com sucesso. Sua senha local foi preparada para o acesso rapido.', 'success');
        if (isMobileViewport()) {
          setAuthPanelOpen(false);
        }
        renderInterface();
        goTo('perfil');
        performPendingAction();
      });
    }
  }

  function bindProfileActions() {
    if (!logoutButton) {
      return;
    }

    logoutButton.addEventListener('click', function () {
      logoutCurrentUser('Sessao encerrada. Voce pode entrar novamente quando quiser.');
    });
  }

  function bindQuickAuthPanel() {
    if (quickAuthHandle) {
      quickAuthHandle.addEventListener('click', function (event) {
        event.stopPropagation();
        setAuthPanelOpen(!state.authPanelOpen);

        if (state.authPanelOpen && !state.user && quickLoginEmail) {
          window.setTimeout(function () {
            quickLoginEmail.focus();
          }, 50);
        }
      });
    }

    if (quickAuthMobileTrigger) {
      quickAuthMobileTrigger.addEventListener('click', function (event) {
        event.stopPropagation();
        setAuthPanelOpen(true);

        if (!state.user && quickLoginEmail) {
          window.setTimeout(function () {
            quickLoginEmail.focus();
          }, 50);
        }
      });
    }

    if (quickAuthClose) {
      quickAuthClose.addEventListener('click', function () {
        setAuthPanelOpen(false);
      });
    }

    if (quickAuthBackdrop) {
      quickAuthBackdrop.addEventListener('click', function () {
        setAuthPanelOpen(false);
      });
    }

    if (quickLoginForm) {
      quickLoginForm.addEventListener('submit', async function (event) {
        var loginResult;
        event.preventDefault();

        loginResult = await loginWithLocalCredentials(
          quickLoginEmail ? quickLoginEmail.value : '',
          quickLoginPassword ? quickLoginPassword.value : ''
        );

        setStatus(quickAuthStatus, loginResult.message, loginResult.ok ? 'success' : 'error');
        setStatus(authStatus, loginResult.message, loginResult.ok ? 'success' : 'error');

        if (!loginResult.ok) {
          return;
        }

        if (isMobileViewport()) {
          setAuthPanelOpen(false);
        }

        renderInterface();
        performPendingAction();
      });
    }

    if (quickForgotPassword) {
      quickForgotPassword.addEventListener('click', function () {
        var forgotMessage = 'Recuperacao de senha entra na futura integracao com Firebase Authentication. Use a tela de perfil para recriar a conta local nesta etapa.';
        setStatus(quickAuthStatus, forgotMessage, '');
        setStatus(authStatus, forgotMessage, '');
        goTo('perfil');
      });
    }

    if (quickLogoutButton) {
      quickLogoutButton.addEventListener('click', function () {
        logoutCurrentUser('Sessao encerrada no acesso rapido.');
      });
    }

    document.addEventListener('click', function (event) {
      var clickedProfileTrigger = event.target.closest('[data-route="perfil"]');

      if (!state.authPanelOpen || !quickAuthPanel) {
        return;
      }

      if (quickAuthPanel.contains(event.target) || clickedProfileTrigger) {
        return;
      }

      setAuthPanelOpen(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && state.authPanelOpen) {
        setAuthPanelOpen(false);
      }
    });

    window.addEventListener('resize', function () {
      if (!isMobileViewport() && quickAuthBackdrop) {
        quickAuthBackdrop.setAttribute('aria-hidden', 'true');
      }
    });
  }

  function bindLegalBanner() {
    if (!acceptLegalButton) {
      return;
    }

    acceptLegalButton.addEventListener('click', function () {
      state.legalAccepted = true;
      window.localStorage.setItem(storageKeys.legalAccepted, 'true');
      window.localStorage.removeItem('marketCarLegalAccepted');
      legalBanner.hidden = true;
      renderLegalBanner();
    });
  }

  function bindUpdateBanner() {
    if (!updateNowButton) {
      return;
    }

    updateNowButton.addEventListener('click', function () {
      if (!activeServiceWorkerRegistration || !activeServiceWorkerRegistration.waiting) {
        hideUpdateBanner();
        return;
      }

      hideUpdateBanner();
      activeServiceWorkerRegistration.waiting.postMessage({
        type: 'SKIP_WAITING'
      });
    });
  }

  function bindAdminPanel() {
    if (adminSettingsForm) {
      adminSettingsForm.addEventListener('submit', function (event) {
        var nextName;
        var nextPassword;
        var confirmPassword;
        var overridePayload;

        event.preventDefault();

        if (!state.user || !state.user.isAdmin) {
          setStatus(adminSettingsStatus, 'Entre com a conta ADM para alterar essas configuracoes.', 'error');
          return;
        }

        nextName = adminDisplayName ? adminDisplayName.value.trim() : '';
        nextPassword = adminNewPassword ? adminNewPassword.value : '';
        confirmPassword = adminConfirmPassword ? adminConfirmPassword.value : '';

        if (!nextName || !nextPassword || !confirmPassword) {
          setStatus(adminSettingsStatus, 'Preencha nome, nova senha e confirmacao para salvar.', 'error');
          return;
        }

        if (nextPassword !== confirmPassword) {
          setStatus(adminSettingsStatus, 'A nova senha e a confirmacao precisam ser identicas.', 'error');
          return;
        }

        overridePayload = {
          name: nextName,
          password: nextPassword,
          changedAt: new Date().toISOString()
        };

        state.adminOverride = normalizeAdminOverride(overridePayload);
        writeStorage(storageKeys.adminOverride, overridePayload);
        persistSession(buildAdminSessionUser());
        renderInterface();
        setStatus(adminSettingsStatus, 'Credenciais ADM atualizadas localmente para a fase de testes.', 'success');
      });
    }

    if (adminResetButton) {
      adminResetButton.addEventListener('click', function () {
        if (!state.user || !state.user.isAdmin) {
          setStatus(adminSettingsStatus, 'Entre com a conta ADM para restaurar as credenciais padrao.', 'error');
          return;
        }

        if (!window.confirm('Deseja restaurar as credenciais padrao do administrador de teste?')) {
          return;
        }

        window.localStorage.removeItem(storageKeys.adminOverride);
        state.adminOverride = null;
        persistSession(buildAdminSessionUser());
        renderInterface();
        setStatus(adminSettingsStatus, 'Credenciais padrao do administrador restauradas.', 'success');
      });
    }
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

  function bindProtectedActions() {
    if (detailContactButton) {
      detailContactButton.addEventListener('click', function () {
        if (!state.user) {
          promptQuickAuth('Entre para liberar o contato com o vendedor.', {
            type: 'contact',
            href: detailContactButton.dataset.contactHref
          });
          renderDetailAccess();
          return;
        }

        window.open(detailContactButton.dataset.contactHref, '_blank', 'noopener,noreferrer');
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
      navigator.serviceWorker.register('sw.js').then(function (registration) {
        checkForUpdate(registration);
        return registration.update().catch(function () {
          return null;
        });
      }).catch(function (error) {
        console.warn('Falha ao registrar o service worker:', error);
      });
    });

    navigator.serviceWorker.addEventListener('controllerchange', function () {
      if (isReloadingForUpdate) {
        return;
      }

      isReloadingForUpdate = true;
      window.location.reload();
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
    bindCatalogSearch();
    bindAuthSwitch();
    bindAuthForms();
    bindProfileActions();
    bindQuickAuthPanel();
    bindPlanButtons();
    bindAdForm();
    bindProtectedActions();
    bindLegalBanner();
    bindUpdateBanner();
    bindAdminPanel();
    bindBrowserNavigation();
    registerServiceWorker();
    showFirebaseStatus();

    var initialRoute = normalizeRoute(window.location.hash.replace('#', ''));
    updateView(initialRoute);
    syncHash(initialRoute);
  }

  document.addEventListener('DOMContentLoaded', start);
})();
