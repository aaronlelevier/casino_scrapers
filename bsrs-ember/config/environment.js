/* jshint node: true */

module.exports = function(environment) {
  var ENV = {
    modulePrefix: 'bsrs-ember',
    environment: environment,
    baseURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      }
    },
    i18n: {
      defaultLocale: 'en'
    },

    APP: {
      defaultWaitForTimeout: 300
      // Here you can pass flags/options to your application instance
      // when it is created
    }
  };//ENV

  ENV.APP.NAMESPACE = '/api';

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    ENV.APP.LOG_TRANSITIONS = true;
    ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;

    ENV.contentSecurityPolicy = {
        // 'default-src': "'none'",
        // 'script-src': "'self'",
        // 'font-src': "'self'",
        'connect-src': "'self' http://bs-webdev03.bigskytech.com http://127.0.0.1:8000",
        //'connect-src': "'self' http://10.1.6.160:8000 http://127.0.0.1:8000",
        'img-src': "'self' data:",
        'style-src': "'self' 'unsafe-inline'"
        // 'media-src': "'self'"
    };
  }//env-development

  if (environment === 'test') {
    // Testem prefers this...

    //ENV.baseURL = '/';
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
  }

  if (environment === 'production') {

  }

  return ENV;
};
