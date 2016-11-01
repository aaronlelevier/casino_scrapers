var BSRS_ROUTING_EVENT_DEFAULTS = (function() {
  var factory = function() {
  };
  factory.prototype.defaults = function() {
    return {
      idOne: '64a4401d-bfc1-492a-9b58-aa2310a81da0',
      idTwo: '64a4401d-bfc1-492a-9b58-aa2310a81da1',
      keyOne: 'automation.event.ticket_status_new',
      keyOneValue: 'Ticket: Status New',
      keyTwo: 'automation.event.ticket_status_deferred',
      keyTwoValue: 'Ticket: Status Deferred',
    };
  };
  return factory;
})();

if (typeof window === 'undefined') {
  module.exports = new BSRS_ROUTING_EVENT_DEFAULTS().defaults();
}
else {
  define('bsrs-ember/vendor/defaults/automation-event',
    ['exports'], function(exports) {
    'use strict';
    return new BSRS_ROUTING_EVENT_DEFAULTS().defaults();
  });
}
