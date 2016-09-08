var BSRS_PERSON_JOIN_PH_OBJECT = (function() {
  var factory = function() {
  };
  factory.prototype.defaults = function() {
    return {
      idOne: 'w24695d0-a82d-053n-a0c3-p87caa47ac44',
      idTwo: 'wae402c7-7f38-2p42-8e18-99ecd06ed046',
      idThree: 'wdd8eeea-c2f8-8x86-8fbf-ef28m28c801b',
    };
  };
  return factory;
})();

if (typeof window === 'undefined') {
  module.exports = new BSRS_PERSON_JOIN_PH_OBJECT().defaults();
} else {
  define('bsrs-ember/vendor/defaults/person-join-phonenumber', ['exports'], function (exports) {
    'use strict';
    return new BSRS_PERSON_JOIN_PH_OBJECT().defaults();
  });
}

