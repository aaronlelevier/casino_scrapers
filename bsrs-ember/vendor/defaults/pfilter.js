var BSRS_PROFILE_FILTER_DEFAULTS_OBJECT = (function() {
  var factory = function(location_level) {
    this.location_level = location_level;
  };
  factory.prototype.defaults = function() {
    return {
      idOne: '6f4e19c2-54c3-4db4-9742-387f64eca721',
      idTwo: '6f4e19c2-54c3-4db4-9742-387f64eca722',
      unusedId: '6f4e19c2-54c3-4db4-9742-387f64eca72b',
      autoAssignId: '9f4e19c2-54c3-4db4-8742-487f64eca72z',
      keyOne: 'admin.placeholder.ticket_priority',
      keyTwo: this.location_level.nameDistrict,
      autoAssignKey: 'admin.placeholder.auto_assign',
      fieldOne: 'priority',
      locationField: 'location',
      autoAssignField: 'auto_assign',
      lookupsEmpty: {}, // non-dynamic available filters
      lookupsDynamic: {
        id: this.location_level.idDistrict,
        name: this.location_level.nameDistrict,
      }
    };
  };
  return factory;
})();

if (typeof window === 'undefined') {
    var location_level = require('./location-level');
  module.exports = new BSRS_PROFILE_FILTER_DEFAULTS_OBJECT(location_level).defaults();
}
else {
  define('bsrs-ember/vendor/defaults/pfilter', ['exports', 'bsrs-ember/vendor/defaults/location-level'], function(exports, location_level) {
    'use strict';
    return new BSRS_PROFILE_FILTER_DEFAULTS_OBJECT(location_level).defaults();
  });
}
