var BSRS_CURRENCY_DEFAULTS_OBJECT = (function() {
  var factory = function() {};
  factory.prototype.defaults = function() {
    return {
      id: '2e92dc64-8646-4ef4-823f-407b5a3a2853',
      idOne: '2e92dc64-8646-4ef4-823f-407b5a3a2853',
      symbol: '$',
      name: 'US Dollar',
      decimal_digits: 2,
      code: 'USD',
      name_plural: 'US dollars',
      rounding: 0,
      symbol_native: '$',
      // Euro
      idEuro: 'ace31029-1a97-4759-a986-76cf84f657c7',
      idTwo: '2e92dc64-8646-4ef4-823f-407b5a3a2854',
      symbolEuro: '€',
      nameEuro: 'Euro',
      decimal_digitsEuro: 2,
      codeEuro: 'EUR',
      name_pluralEuro: 'Euros',
      roundingEuro: 0,
      symbol_nativeEuro: '€',
      // CAD
      idCAD: '7c6b8e17-05ba-4f67-be42-15348df790ba',
      codeCAD: 'CAD',

      // auth amounts
      authAmountOne: 123.11,
      authAmountTwo: 234.12
    };
  };
  return factory;
})();

if (typeof window === 'undefined') {
  module.exports = new BSRS_CURRENCY_DEFAULTS_OBJECT().defaults();
}
else {
  define('bsrs-ember/vendor/defaults/currency', ['exports'], function(exports) {
    'use strict';
    return new BSRS_CURRENCY_DEFAULTS_OBJECT().defaults();
  });
}