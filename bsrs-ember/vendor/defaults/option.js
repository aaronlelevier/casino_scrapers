var BSRS_OPTIONS_DEFAULTS_OBJECT = (function() {
  var factory = function() {
  };
  factory.prototype.defaults = function() {
    return {
      idOne: 'b12695d0-a82d-451f-a9c3-d87aaa47ac44',
      idTwo: 'b12695d0-a82d-451f-a9c3-d87aaa47ac45',
      idThree: 'b12695d0-a82d-451f-a9c3-d87aaa47ac46',
      idRando: 'f3b0b7dc-7986-4ec8-93fe-a90b578c17e0',
      idRando2: '333bc4dd-c727-4e00-b6d5-9c55f1f179f4',
      textOne: 'yes',
      textTwo: 'no',
      textThree: 'maybe',
      textFour: 'another yes',
      orderOne: 0,
      orderTwo: 1,
      orderThree: 2
    };
  };
  return factory;
})();

if (typeof window === 'undefined') {
  module.exports = new BSRS_OPTIONS_DEFAULTS_OBJECT().defaults();
} else {
  define('bsrs-ember/vendor/defaults/option',
         ['exports'],
         function (exports) {
           'use strict';
           return new BSRS_OPTIONS_DEFAULTS_OBJECT().defaults();
         });
}
