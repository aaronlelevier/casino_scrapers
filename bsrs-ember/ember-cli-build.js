/*jshint node:true*/
/* global require, module */

var EmberApp = require('ember-cli/lib/broccoli/ember-app');
var funnel = require('broccoli-funnel');
var shim = require('flexi/lib/pod-templates-shim');
shim(EmberApp);

var es5Shim = funnel('node_modules/es5-shim', {
  files: ['es5-shim.js'],
  destDir: '/assets'
});

module.exports = function(defaults) {
  var app = new EmberApp(defaults, {
    'fingerprint': {
      prepend: '/static/'
    },
    babel: {
        optional: ['es7.decorators'],
        includePolyfill: true
    },
    minifyJS: {
        enabled: false
    },
  });
  app.import('vendor/defaults/uuid.js');
  app.import('vendor/defaults/global-message.js');
  app.import('bower_components/ember/ember-template-compiler.js');
  if(app.env !== 'production') {
      app.import('vendor/timemachine.js', {exports: {'vendor/timemachine': ['default']}});
      app.import('bower_components/fauxjax-toranb/dist/fauxjax.min.js');
      app.import('vendor/mixin.js');
      app.import('vendor/address_fixtures.js');
      app.import('vendor/admin_translation_fixtures.js');
      app.import('vendor/automation_fixtures.js');
      app.import('vendor/country_fixtures.js');
      app.import('vendor/criteria_fixtures.js');
      app.import('vendor/dtd_fixtures.js');
      app.import('vendor/email_fixtures.js');
      app.import('vendor/locale_fixtures.js');
      app.import('vendor/location_fixtures.js');
      app.import('vendor/location-level_fixtures.js');
      app.import('vendor/people_fixtures.js');
      app.import('vendor/phone_number_fixtures.js');
      app.import('vendor/role_fixtures.js');
      app.import('vendor/state_fixtures.js');
      app.import('vendor/tenant_fixtures.js');
      app.import('vendor/third_party_fixtures.js');
      app.import('vendor/ticket_fixtures.js');
      app.import('vendor/ticket_activity_fixtures.js');
      app.import('vendor/category_fixtures.js');
      app.import('vendor/tab_fixtures.js');
      app.import('vendor/translation_fixtures.js');
      app.import('vendor/defaults/address-type.js');
      app.import('vendor/defaults/address.js');
      app.import('vendor/defaults/criteria.js');
      app.import('vendor/defaults/automation-event.js');
      app.import('vendor/defaults/automation-join-event.js');
      app.import('vendor/defaults/automation-join-pfilter.js');
      app.import('vendor/defaults/pfilter-join-criteria.js');
      app.import('vendor/defaults/automation.js');
      app.import('vendor/defaults/category-children.js');
      app.import('vendor/defaults/country.js');
      app.import('vendor/defaults/currencies.js');
      app.import('vendor/defaults/category.js');
      app.import('vendor/defaults/dtd.js');
      app.import('vendor/defaults/dtd-link.js');
      app.import('vendor/defaults/email.js');
      app.import('vendor/defaults/email-type.js');
      app.import('vendor/defaults/field.js');
      app.import('vendor/defaults/general.js');
      app.import('vendor/defaults/link.js');
      app.import('vendor/defaults/locale.js');
      app.import('vendor/defaults/locale-translation.js');
      app.import('vendor/defaults/location.js');
      app.import('vendor/defaults/location-join-address.js');
      app.import('vendor/defaults/location-join-email.js');
      app.import('vendor/defaults/location-join-phonenumber.js');
      app.import('vendor/defaults/location-children.js');
      app.import('vendor/defaults/location-parents.js');
      app.import('vendor/defaults/location-level.js');
      app.import('vendor/defaults/location-status.js');
      app.import('vendor/defaults/option.js');
      app.import('vendor/defaults/person.js');
      app.import('vendor/defaults/person-current.js');
      app.import('vendor/defaults/person-location.js');
      app.import('vendor/defaults/person-put.js');
      app.import('vendor/defaults/phone-number.js');
      app.import('vendor/defaults/phone-number-type.js');
      app.import('vendor/defaults/person-join-email.js');
      app.import('vendor/defaults/person-join-phonenumber.js');
      app.import('vendor/defaults/pfilter.js');
      app.import('vendor/defaults/role.js');
      app.import('vendor/defaults/role-category.js');
      app.import('vendor/defaults/state.js');
      app.import('vendor/defaults/status.js');
      app.import('vendor/defaults/tenant.js');
      app.import('vendor/defaults/ticket.js');
      app.import('vendor/defaults/ticket_activity.js');
      app.import('vendor/defaults/ticket-join-person.js');
      app.import('vendor/defaults/ticket-priority.js');
      app.import('vendor/defaults/model-category.js');
      app.import('vendor/defaults/translation.js');
      app.import('vendor/defaults/tab.js');
  }
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
