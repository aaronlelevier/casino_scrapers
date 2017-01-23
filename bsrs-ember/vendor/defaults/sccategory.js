var BSRS_SC_CATEGORY_DEFAULTS_OBJECT = (function() {
  var factory = function() {};
  factory.prototype.defaults = function() {
    return {
      idOne: '1099b609-fe22-4cac-a3e2-72d3b804e2b1',
      idTwo: '1099b609-fe22-4cac-a3e2-72d3b804e2b2',
      nameOne: 'General Repair',
      nameTwo: 'General Maintenance',
    };
  };
  return factory;
})();

if (typeof window === 'undefined') {
  module.exports = new BSRS_SC_CATEGORY_DEFAULTS_OBJECT().defaults();
}
else {
  define('bsrs-ember/vendor/defaults/sccategory', ['exports'], function(exports) {
    'use strict';
    return new BSRS_SC_CATEGORY_DEFAULTS_OBJECT().defaults();
  });
}