var BSRS_AVAILABLE_FILTER_DEFAULTS_OBJECT = (function() {
  var factory = function(location_level) {
    this.location_level = location_level;
  };
  factory.prototype.defaults = function() {
    return {
      idOne: '2z7813ee-0d02-4c75-a7eb-773420a4c971',
      idTwo: '2z7813ee-0d02-4c75-a7eb-773420a4c972',
      unusedId: '0a7813ee-0d02-4c75-a7eb-773420a4c97f',
      nameOne: 'foo',
      nameTwo: 'bar',
      nameThree: 'biz'
      // keyOne: 'admin.placeholder.ticket_priority',
      // keyTwo: 'admin.placeholder.location_store',
      // key_is_i18nOne: true,
      // key_is_i18nTwo: false,
      // contextOne: 'ticket.ticket',
      // fieldOne: 'priority',
      // fieldTwo: 'location',
      // lookupsEmpty: {}, // non-dynamic available filters
      // lookupsDynamic: {
      //   location_level: this.location_level.idOne
      // }
    };
  };
  return factory;
})();

if (typeof window === 'undefined') {
    var location_level = require('./location_level');
  module.exports = new BSRS_AVAILABLE_FILTER_DEFAULTS_OBJECT(location_level).defaults();
}
else {
  define('bsrs-ember/vendor/defaults/criteria', ['exports', 'bsrs-ember/vendor/defaults/location-level'], function(exports, location_level) {
    'use strict';
    return new BSRS_AVAILABLE_FILTER_DEFAULTS_OBJECT(location_level).defaults();
  });
}
