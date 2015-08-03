var BSRS_LOCATION_LEVEL_FACTORY = (function() {
    var factory = function(location_level_defaults) {
        this.id = location_level_defaults.id;
        this.idTwo = location_level_defaults.idTwo;
        this.nameCompany = location_level_defaults.nameCompany;
        this.nameRegion = location_level_defaults.nameRegion;
        this.nameStore = location_level_defaults.nameStore;
        this.nameDistrict = location_level_defaults.nameDistrict;
    };
    factory.prototype.get = function() {
        return {
            id: this.id,
            name: this.nameCompany
        }
    };
    factory.prototype.put = function(location_level) {
        var location_levels = {id: this.id, name: this.nameCompany};
        if(!location_level) {
            return location_levels;
        }
        return location_levels;
    };
    return factory;
})();

if (typeof window === 'undefined') {
    var location_level_defaults = require('./defaults/location_level');
    module.exports = new BSRS_LOCATION_LEVEL_FACTORY(location_level_defaults);
} else {
    define('bsrs-ember/vendor/location_level_fixtures', ['exports', 'bsrs-ember/vendor/defaults/location-level'], function (exports, location_level_defaults) {
        'use strict';
        return new BSRS_LOCATION_LEVEL_FACTORY(location_level_defaults);
    });
}

