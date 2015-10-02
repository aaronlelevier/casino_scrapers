/* global require, module */

var EmberApp = require('ember-cli/lib/broccoli/ember-app');
var funnel = require('broccoli-funnel');
var broccoliLeasot = require('broccoli-leasot');

var es5Shim = funnel('node_modules/es5-shim', {
  files: ['es5-shim.js'],
  destDir: '/assets'
});

module.exports = function(environment) {
  var app = new EmberApp({
    'ember-cli-selectize': {
      theme: 'bootstrap3'
    },
    'markers': {
      enabled: true,
      kinds: ['TODO']
    },
    'fingerprint': {
      prepend: '/static/'
    },
  });

  //app.import('bower_components/ember/ember-template-compiler.js');
  app.import('bower_components/fauxjax/dist/fauxjax.min.js');
  app.import('vendor/mixin.js');
  app.import('vendor/address_fixtures.js');
  app.import('vendor/location_fixtures.js');
  app.import('vendor/location_level_fixtures.js');
  app.import('vendor/people_fixtures.js');
  app.import('vendor/phone_number_fixtures.js');
  app.import('vendor/role_fixtures.js');
  app.import('vendor/category_fixtures.js');
  app.import('vendor/translation_fixtures.js');
  app.import('vendor/defaults/address-type.js');
  app.import('vendor/defaults/address.js');
  app.import('vendor/defaults/country.js');
  app.import('vendor/defaults/currencies.js');
  app.import('vendor/defaults/category.js');
  app.import('vendor/defaults/location.js');
  app.import('vendor/defaults/location-level.js');
  app.import('vendor/defaults/location-status.js');
  app.import('vendor/defaults/person.js');
  app.import('vendor/defaults/person-current.js');
  app.import('vendor/defaults/person-location.js');
  app.import('vendor/defaults/person-put.js');
  app.import('vendor/defaults/phone-number.js');
  app.import('vendor/defaults/phone-number-type.js');
  app.import('vendor/defaults/role.js');
  app.import('vendor/defaults/state.js');
  app.import('vendor/defaults/status.js');
  app.import('vendor/defaults/uuid.js');
  app.import('vendor/defaults/global-message.js');
  // Use `app.import` to add additional libraries to the generated
  // output files.
  //
  // If you need to use different assets in different
  // environments, specify an object as the first parameter. That
  // object's keys should be the environment name and the values
  // should be the asset to use in that environment.
  //
  // If the library that you are including contains AMD or ES6
  // modules that you would like to import into your application
  // please specify an object with the list of modules as keys
  // along with the exports of each module as its value.

  return app.toTree([es5Shim]);
}
