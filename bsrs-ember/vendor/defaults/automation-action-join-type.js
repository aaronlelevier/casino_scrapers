var BSRS_AUTOMATION_ACTION_JOIN_TYPE_DEFAULTS = (function() {
  var factory = function() {
  };
  factory.prototype.defaults = function() {
    return {
      idOne: '64a4401d-bfc1-492a-9b58-aa2310a81da56852525rty',
      idTwo: '64a4401d-bfc1-492a-9b58-aa2310a81da636985959rt'
    };
  };
  return factory;
})();

if (typeof window === 'undefined') {
  module.exports = new BSRS_AUTOMATION_ACTION_JOIN_TYPE_DEFAULTS().defaults();
}
else {
  define('bsrs-ember/vendor/defaults/automation-action-join-type',
    ['exports'], function(exports) {
    'use strict';
    return new BSRS_AUTOMATION_ACTION_JOIN_TYPE_DEFAULTS().defaults();
  });
}
