var BSRS_PROFILE_FILTER_DEFAULTS_OBJECT = (function() {
  var factory = function() {
  };
  factory.prototype.defaults = function() {
    return {
      idOne: '1ee82b8c-89bd-45a2-8d57-4b920c8b1111',
      idTwo: '2cc82b8c-89bd-45a2-8d57-4b920c8b1112',
      unusedId: '00082b8c-89bd-45a2-8d57-4b920c8b1000',
      keyOne: 'admin.placeholder.ticket_priority',
      keyTwo: 'admin.placeholder.location_store',
      contextOne: 'ticket.ticket',
      fieldOne: 'priority',
      fieldTwo: 'location'
    };
  };
  return factory;
})();

if (typeof window === 'undefined') {
  module.exports = new BSRS_PROFILE_FILTER_DEFAULTS_OBJECT().defaults();
}
else {
  define('bsrs-ember/vendor/defaults/profile-filter', ['exports'], function(exports) {
    'use strict';
    return new BSRS_PROFILE_FILTER_DEFAULTS_OBJECT().defaults();
  });
}
