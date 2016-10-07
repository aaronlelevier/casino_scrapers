var BSRS_STATUS_DEFAULTS_OBJECT = (function() {
  var factory = function() {
  };
  factory.prototype.defaults = function() {
    return {
      idOne: 'dfe28a24-307f-4da0-85e7-cdac016808c0',
      idTwo: '2a4c8c9c-7acb-44ca-af95-62a84e410e09',
      nameOne: 'ticket.status.new',
      nameTwo: 'ticket.status.draft'
    };
  };
  return factory;
})();

if (typeof window === 'undefined') {
  module.exports = new BSRS_STATUS_DEFAULTS_OBJECT().defaults();
} else {
  define('bsrs-ember/vendor/defaults/ticket-status', ['exports'], function (exports) {
    'use strict';
    return new BSRS_STATUS_DEFAULTS_OBJECT().defaults();
  });
}
