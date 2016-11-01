var BSRS_AUTOMATION_JOIN_ACTION_DEFAULTS = (function() {
  var factory = function() {
  };
  factory.prototype.defaults = function() {
    return {
      idOne: '7eb204ec-da87-4929-aaa9-c14f4b7950667453',
      idTwo: '7eb204ec-da87-4929-aaa9-c14f4b7950627645',
      idThree: '7eb204ec-da87-4929-aaa9-c14f4b7950625613',
    };
  };
  return factory;
})();

if (typeof window === 'undefined') {
  module.exports = new BSRS_AUTOMATION_JOIN_ACTION_DEFAULTS().defaults();
}
else {
  define('bsrs-ember/vendor/defaults/automation-join-action',
    ['exports'], function(exports) {
    'use strict';
    return new BSRS_AUTOMATION_JOIN_ACTION_DEFAULTS().defaults();
  });
}
