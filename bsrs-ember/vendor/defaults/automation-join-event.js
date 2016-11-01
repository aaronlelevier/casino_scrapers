var BSRS_AUTOMATION_JOIN_ROUTING_EVENT_DEFAULTS = (function() {
  var factory = function() {
  };
  factory.prototype.defaults = function() {
    return {
      idOne: '7eb204ec-da87-4929-aaa9-c14f4b795061',
      idTwo: '7eb204ec-da87-4929-aaa9-c14f4b795062',
      idThree: '7eb204ec-da87-4929-aaa9-c14f4b795063',
    };
  };
  return factory;
})();

if (typeof window === 'undefined') {
  module.exports = new BSRS_AUTOMATION_JOIN_ROUTING_EVENT_DEFAULTS().defaults();
}
else {
  define('bsrs-ember/vendor/defaults/automation-join-event',
    ['exports'], function(exports) {
    'use strict';
    return new BSRS_AUTOMATION_JOIN_ROUTING_EVENT_DEFAULTS().defaults();
  });
}
