var BSRS_PERSON_JOIN_EMAIL_OBJECT = (function() {
  var factory = function() {
  };
  factory.prototype.defaults = function() {
    return {
      idOne: 'k24695d0-a82d-451f-89c3-p87laa47vw43',
      idTwo: 'kae402c7-7f38-4e42-0e18-99ecm06el049',
      idThree: 'kdd8eeea-c2f8-2f33-8fbf-ef28m28z402q',
    };
  };
  return factory;
})();

if (typeof window === 'undefined') {
  module.exports = new BSRS_PERSON_JOIN_EMAIL_OBJECT().defaults();
} else {
  define('bsrs-ember/vendor/defaults/person-join-email', ['exports'], function (exports) {
    'use strict';
    return new BSRS_PERSON_JOIN_EMAIL_OBJECT().defaults();
  });
}

