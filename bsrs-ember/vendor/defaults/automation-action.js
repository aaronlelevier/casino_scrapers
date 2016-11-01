var BSRS_AUTOMATION_ACTION_DEFAULTS = (function() {
  var factory = function() {
  };
  factory.prototype.defaults = function() {
    return {
      idOne: 'c2037595-4ff8-4851-b880-eb453fadd9d1',
      idTwo: 'c2037595-4ff8-4851-b880-eb453fadd9d2',
      idThree:'c2037595-4ff8-4851-b880-eb453fadd9d3',
      requestOne: 'Ticket request',
      requestTwo: 'Ticket request 2',
    };
  };
  return factory;
})();

if (typeof window === 'undefined') {
  module.exports = new BSRS_AUTOMATION_ACTION_DEFAULTS().defaults();
}
else {
  define('bsrs-ember/vendor/defaults/automation-action',
    ['exports'], function(exports) {
    'use strict';
    return new BSRS_AUTOMATION_ACTION_DEFAULTS().defaults();
  });
}
