var BSRS_PROVIDER_DEFAULTS_OBJECT = (function() {
  var factory = function() {
  };
  factory.prototype.defaults = function() {
    return {
      idOne: 'a7ae2835-ee7c-4604-92f7-045f399493x0',
      idTwo: '62a957f1-6bdc-447b-ac33-1e18c23b32dc',
      unusedId: '86a957f1-6bdc-447b-ac33-1e18c23b32de',
      nameOne: 'Bobs Construction',
      nameTwo: 'Charlies Construction',
      nameUnused: 'Unused Construction',
      logoOne: 'http://pngimg.com/upload/cat_PNG1631.png',
      logoTwo: 'http://pngimg.com/upload/cat_PNG1631.png',
      address1One: 'Colorado Way',
      address1Two: 'Market Way',
      address2One: 'Unit 12',
      cityOne: 'San Diego',
      stateOne: 'CA',
      postalCodeOne: '92126',
      phoneOne: '+18005550239',
      emailOne: 'bob@bconstruction',
    };
  };
  return factory;
})();

if (typeof window === 'undefined') {
  module.exports['default'] = new BSRS_PROVIDER_DEFAULTS_OBJECT();
} else {
  define('bsrs-ember/vendor/defaults/provider', ['exports'], function (exports) {
    'use strict';
    var wo = new BSRS_PROVIDER_DEFAULTS_OBJECT();
    exports.default = wo;
  });
}
