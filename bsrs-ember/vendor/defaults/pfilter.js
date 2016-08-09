var BSRS_PROFILE_FILTER_DEFAULTS_OBJECT = (function() {
  var factory = function(location_level, ticket) {
    this.location_level = location_level;
    this.ticket = ticket;
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
      criteriaOne: [{id: this.ticket.priorityOneId, name: this.ticket.priorityOneKey}],
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
    var ticket = require('./ticket');
  module.exports = new BSRS_PROFILE_FILTER_DEFAULTS_OBJECT(location_level, ticket).defaults();
}
else {
  define('bsrs-ember/vendor/defaults/pfilter',
    ['exports', 'bsrs-ember/vendor/defaults/location-level', 'bsrs-ember/vendor/defaults/ticket'], function(exports, location_level, ticket) {
    'use strict';
    return new BSRS_PROFILE_FILTER_DEFAULTS_OBJECT(location_level, ticket).defaults();
  });
}
