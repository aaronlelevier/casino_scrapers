var BSRS_AUTOMATION_ACTION_DEFAULTS = (function() {
  var factory = function() {
  };
  factory.prototype.defaults = function() {
    return {
      idOne: '64a4401d-bfc1-492a-9b58-aa2310a81da0',
      idTwo: '64a4401d-bfc1-492a-9b58-aa2310a81da1'
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
