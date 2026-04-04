(function () {
  var firebaseSettings = {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: ''
  };

  var hasRequiredConfig = Boolean(
    firebaseSettings.apiKey &&
      firebaseSettings.authDomain &&
      firebaseSettings.projectId &&
      firebaseSettings.appId
  );

  window.marketCarFirebase = {
    config: firebaseSettings,
    isConfigured: hasRequiredConfig,
    services: {
      auth: false,
      firestore: false,
      storage: false
    }
  };
})();
