var BSRS_SENDSMS_JOIN_RECIPIENTS_DEFAULTS_OBJECT = (function() {
  var factory = function() {
  };
  factory.prototype.defaults = function() {
    return {
      idOne: 'pd597dde-74cc-4f8f-a3a5-fbecb4c73d91',
      idTwo: 'pd597dde-74cc-4f8f-a3a5-fbecb4c73d92',
      idThree: 'pd597dde-74cc-4f8f-a3a5-fbecb4c73d93',
    };
  };
  return factory;
})();

if (typeof window === 'undefined') {
  module.exports = new BSRS_SENDSMS_JOIN_RECIPIENTS_DEFAULTS_OBJECT().defaults();
} else {
  define('bsrs-ember/vendor/defaults/sendsms-join-recipients', ['exports'], function (exports) {
    'use strict';
    return new BSRS_SENDSMS_JOIN_RECIPIENTS_DEFAULTS_OBJECT().defaults();
  });
}

