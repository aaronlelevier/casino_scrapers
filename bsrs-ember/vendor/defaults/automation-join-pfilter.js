var BSRS_automation_automationJOINFILTER_DEFAULTS_OBJECT = (function() {
  var factory = function() {
  };
  factory.prototype.defaults = function() {
    return {
      idOne: '1ee82b8c-89bd-45a2-8d57-4b511c8b1100',
      idTwo: '2cc82b8c-89bd-45a2-8d57-4b511c8b1101',
      idThree: '2cc82b8c-89bd-45a2-8d57-4b511c8b1102',
    };
  };
  return factory;
})();

if (typeof window === 'undefined') {
  module.exports = new BSRS_automation_automationJOINFILTER_DEFAULTS_OBJECT().defaults();
}
else {
  define('bsrs-ember/vendor/defaults/automation-join-pfilter', ['exports'], function(exports) {
    'use strict';
    return new BSRS_automation_automationJOINFILTER_DEFAULTS_OBJECT().defaults();
  });
}
