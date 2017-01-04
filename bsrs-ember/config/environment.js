/* jshint node: true */

module.exports = function(environment) {
  var ENV = {
    contentSecurityPolicy: {
      'img-src': "'self' data:",
      'font-src': "'self' data:",
      'script-src': "'self' 'unsafe-inline'",
      'style-src': "'self' 'unsafe-inline'",
      'connect-src': "'self'"
    },
    modulePrefix: 'bsrs-ember',
    environment: environment,
    rootURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      }
    },

    i18n: {
      defaultLocale: 'en',
      currentLocale: 'en'
    },

    moment: {
      // Options:
      // 'all' - all years, all timezones
      // '2010-2020' - 2010-2020, all timezones
      // 'none' - no data, just timezone API
      includeTimezone: 'all',
      includeLocales: true,
      allowEmpty: true // default: false. prevent console errors
    },

    APP: {
      ANIMATION_TIME: 333,
      POWER_SELECT_DEBOUNCE: 300,
      POLL_INTERVAL: 1 * 30 * 1000,
      VALIDATION_TIMEOUT_INTERVAL: 1500
      // Here you can pass flags/options to your application instance
      // when it is created
    },
    DEFAULT_LOCATION: 'Company',
    DEBOUNCE_TIMEOUT_INTERVAL: 300
  };

  ENV.APP.NAMESPACE = '/api';
  ENV.APP.PAGE_SIZE = 10;

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    ENV.DEBOUNCE_TIMEOUT_INTERVAL = 15;
    ENV.APP.ANIMATION_TIME = 15;
    ENV.APP.POLL_INTERVAL = 15;
    ENV.APP.VALIDATION_TIMEOUT_INTERVAL = 15;
    ENV.APP.emberModalDialog = {
      modalRootElementId: 'ember-testing'
    };

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
  }

  if (environment === 'production') {

  }

  return ENV;
};
