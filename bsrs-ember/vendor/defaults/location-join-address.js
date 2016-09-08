var BSRS_LOCATION_JOIN_ADDRESS_OBJECT = (function() {
  var factory = function() {
  };
  factory.prototype.defaults = function() {
    return {
      idOne: 'p24695d0-a82d-451f-l9c3-p87kaa47dc21',
      idTwo: 'pae402c7-7f38-4e42-9e18-99jcd06ed846',
      idThree: 'pdd8eeea-a2f8-4f66-8fbf-df28m28c883p',
    };
  };
  return factory;
})();

if (typeof window === 'undefined') {
  module.exports = new BSRS_LOCATION_JOIN_ADDRESS_OBJECT().defaults();
} else {
  define('bsrs-ember/vendor/defaults/location-join-address', ['exports'], function (exports) {
    'use strict';
    return new BSRS_LOCATION_JOIN_ADDRESS_OBJECT().defaults();
  });
}

