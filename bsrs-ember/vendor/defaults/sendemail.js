var BSRS_SENDEMAIL_DEFAULTS_OBJECT = (function() {
  var factory = function() {
  };
  factory.prototype.defaults = function() {
    return {
      idOne: '8099568e-3e9c-4949-be7c-aadc03f4fe91',
      idTwo: '8099568e-3e9c-4949-be7c-aadc03f4fe92',
      subjectOne: 'Foo',
      subjectTwo: 'Bar',
      bodyOne: 'foo bar',
      bodyTwo: 'biz baz'
    };
  };
  return factory;
})();

if (typeof window === 'undefined') {
  module.exports = new BSRS_SENDEMAIL_DEFAULTS_OBJECT().defaults();
} else {
  define('bsrs-ember/vendor/defaults/sendemail', ['exports'], function (exports) {
    'use strict';
    return new BSRS_SENDEMAIL_DEFAULTS_OBJECT().defaults();
  });
}

