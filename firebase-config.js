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
    },
    plannedCollections: {
      users: 'users',
      ads: 'ads'
    },
    plannedFlows: {
      signIn: 'email-password',
      signUp: 'email-password',
      ads: 'draft-to-firestore'
    }
  };
})();
