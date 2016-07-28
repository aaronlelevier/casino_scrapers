var BSRS_PROFILE_FILTER_DEFAULTS_OBJECT = (function() {
  var factory = function(location_level) {
    this.location_level = location_level;
  };
  factory.prototype.defaults = function() {
    return {
      idOne: '6f4e19c2-54c3-4db4-9742-387f64eca721',
      idTwo: '6f4e19c2-54c3-4db4-9742-387f64eca722',
      unusedId: '6f4e19c2-54c3-4db4-9742-387f64eca72b',
      lookupsEmpty: {}, // non-dynamic available filters
      lookupsDynamic: {
        location_level: this.location_level.idOne
      }
    };
  };
  return factory;
})();

if (typeof window === 'undefined') {
    var location_level = require('./location_level');
  module.exports = new BSRS_PROFILE_FILTER_DEFAULTS_OBJECT(location_level).defaults();
}
else {
  define('bsrs-ember/vendor/defaults/pfilter', ['exports', 'bsrs-ember/vendor/defaults/location-level'], function(exports, location_level) {
    'use strict';
    return new BSRS_PROFILE_FILTER_DEFAULTS_OBJECT(location_level).defaults();
  });
}
