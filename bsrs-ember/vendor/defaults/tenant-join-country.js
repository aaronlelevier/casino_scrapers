var BSRS_TENANT_TENANTJOINCOUNTRY_DEFAULTS_OBJECT = (function() {
  var factory = function() {
  };
  factory.prototype.defaults = function() {
    return {
      idOne: '1ee82b8c-89bd-45a2-8d57-4b920c8b1111',
      idTwo: '2cc82b8c-89bd-45a2-8d57-4b920c8b1112',
      unusedId: '00082b8c-89bd-45a2-8d57-4b920c8b1000',
      nameOne: '',
      nameTwo: '',
    };
  };
  return factory;
})();

if (typeof window === 'undefined') {
  module.exports = new BSRS_TENANT_TENANTJOINCOUNTRY_DEFAULTS_OBJECT().defaults();
}
else {
  define('bsrs-ember/vendor/defaults/tenant-join-country', ['exports'], function(exports) {
    'use strict';
    return new BSRS_TENANT_TENANTJOINCOUNTRY_DEFAULTS_OBJECT().defaults();
  });
}
