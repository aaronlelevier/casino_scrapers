var BSRS_GENERIC_JOIN_RECIPIENTS_DEFAULTS_OBJECT = (function() {
  var factory = function() {
  };
  factory.prototype.defaults = function() {
    return {
      idOne: '7c597dde-74cc-4f8f-a3a5-fbecb4c73d61',
      idTwo: '7c597dde-74cc-4f8f-a3a5-fbecb4c73d62',
      idThree: '7c597dde-74cc-4f8f-a3a5-fbecb4c73d63',
    };
  };
  return factory;
})();

if (typeof window === 'undefined') {
  module.exports = new BSRS_GENERIC_JOIN_RECIPIENTS_DEFAULTS_OBJECT().defaults();
} else {
  define('bsrs-ember/vendor/defaults/generic-join-recipients', ['exports'], function (exports) {
    'use strict';
    return new BSRS_GENERIC_JOIN_RECIPIENTS_DEFAULTS_OBJECT().defaults();
  });
}

