var BSRS_LOCATION_JOIN_EMAIL_OBJECT = (function() {
  var factory = function() {
  };
  factory.prototype.defaults = function() {
    return {
      idOne: 'h24695d0-a82d-451f-19c3-p87laa47vw43',
      idTwo: 'hae402c7-7f38-4e42-8e18-99ecm06el049',
      idThree: 'hdd8eeea-c2f8-4f66-8fbf-ef28m28z402q',
    };
  };
  return factory;
})();

if (typeof window === 'undefined') {
  module.exports = new BSRS_LOCATION_JOIN_EMAIL_OBJECT().defaults();
} else {
  define('bsrs-ember/vendor/defaults/location-join-email', ['exports'], function (exports) {
    'use strict';
    return new BSRS_LOCATION_JOIN_EMAIL_OBJECT().defaults();
  });
}

