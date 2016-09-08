var BSRS_LOCATION_JOIN_PH_OBJECT = (function() {
  var factory = function() {
  };
  factory.prototype.defaults = function() {
    return {
      idOne: 'b24695d0-a82d-451f-a9c3-p87caa47ac44',
      idTwo: 'bae402c7-7f38-4e42-8e18-99ecd06ed046',
      idThree: 'bdd8eeea-c2f8-4f66-8fbf-ef28m28c801b',
    };
  };
  return factory;
})();

if (typeof window === 'undefined') {
  module.exports = new BSRS_LOCATION_JOIN_PH_OBJECT().defaults();
} else {
  define('bsrs-ember/vendor/defaults/location-join-phonenumber', ['exports'], function (exports) {
    'use strict';
    return new BSRS_LOCATION_JOIN_PH_OBJECT().defaults();
  });
}

