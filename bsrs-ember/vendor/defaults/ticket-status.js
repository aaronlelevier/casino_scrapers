var BSRS_TICKET_STATUS_DEFAULTS_OBJECT = (function() {
  var factory = function() {
  };
  factory.prototype.defaults = function() {
    return {
      idOne: '5ab9b1fb-c624-4214-bb4c-16567b3d37e6',
      idTwo: 'dfa1f64f-d0d7-4915-be85-54b8c38d3aeb',
      nameOne: 'ticket.status.new',
      nameTwo: 'ticket.status.draft',
      keyOne: 'ticket.status.new',
      keyTwo: 'ticket.status.draft',
      keyOneValue: 'New',
      keyTwoValue: 'Draft'
    };
  };
  return factory;
})();

if (typeof window === 'undefined') {
  module.exports = new BSRS_TICKET_STATUS_DEFAULTS_OBJECT().defaults();
} else {
  define('bsrs-ember/vendor/defaults/ticket-status', ['exports'], function (exports) {
    'use strict';
    return new BSRS_TICKET_STATUS_DEFAULTS_OBJECT().defaults();
  });
}
