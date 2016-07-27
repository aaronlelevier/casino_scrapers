var BSRS_<%= CapitalizeModule %>_<%= thirdAssociatedModel %>_DEFAULTS_OBJECT = (function() {
  var factory = function() {
  };
  factory.prototype.defaults = function() {
    return {
      idOne: '1ee82b8c-89bd-45a2-8d57-4b920c8b1111',
      idTwo: '2cc82b8c-89bd-45a2-8d57-4b920c8b1112',
      <%= secondPropertyCamel %>One: '',
      <%= secondPropertyCamel %>Two: '',
    };
  };
  return factory;
})();

if (typeof window === 'undefined') {
  module.exports = new BSRS_<%= CapitalizeModule %>_<%= thirdAssociatedModel %>_DEFAULTS_OBJECT().defaults();
}
else {
  define('bsrs-ember/vendor/defaults/<%= thirdAssociatedModel %>', ['exports'], function(exports) {
    'use strict';
    return new BSRS_<%= CapitalizeModule %>_<%= thirdAssociatedModelCaps %>_DEFAULTS_OBJECT().defaults();
  });
}
