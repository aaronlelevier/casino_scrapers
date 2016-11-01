var BSRS_SENDSMS_DEFAULTS_OBJECT = (function() {
  var factory = function() {
  };
  factory.prototype.defaults = function() {
    return {
      idOne: 'a199568e-3e9c-4949-be7c-aadc03f4fe38',
      idTwo: 'a199568e-3e9c-4949-be7c-aadc03f4fe39',
      messageOne: 'Foo',
      messageTwo: 'Bar',
    };
  };
  return factory;
})();

if (typeof window === 'undefined') {
  module.exports = new BSRS_SENDSMS_DEFAULTS_OBJECT().defaults();
} else {
  define('bsrs-ember/vendor/defaults/sendsms', ['exports'], function (exports) {
    'use strict';
    return new BSRS_SENDSMS_DEFAULTS_OBJECT().defaults();
  });
}

