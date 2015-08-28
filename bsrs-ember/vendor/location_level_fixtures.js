var BSRS_LOCATION_LEVEL_FACTORY = (function() {
    var factory = function(location_level_defaults) {
        this.idOne = location_level_defaults.idOne;
        this.idTwo = location_level_defaults.idTwo;
        this.idThree = location_level_defaults.idThree;
        this.nameCompany = location_level_defaults.nameCompany;
        this.nameRegion = location_level_defaults.nameRegion;
        // this.nameStore = location_level_defaults.nameStore;
        this.nameDistrict = location_level_defaults.nameDistrict;
    };
    factory.prototype.generate = function(i) {
        return {
            id: i,
            name : this.nameCompany,
            children: [],
            parents: []
        }
    };
    factory.prototype.detail = function(i) {
        return {id: this.idOne, name : this.nameCompany};
    };
    factory.prototype.list = function() {
        response = [ { id: this.idOne, name : this.nameCompany }, { id: this.idTwo, name : this.nameDistrict}, { id: this.idThree, name : this.nameRegion} ];
        return {'count':3,'next':null,'previous':null,'results': response};
    };
    factory.prototype.empty = function() {
        return {'count':3,'next':null,'previous':null,'results': []};
    };
    factory.prototype.put = function(level) {
        var location_levels = this.detail();
        level.children = [];
        for(var key in level) {
            location_levels[key] = level[key];
        }
        return location_levels;
    };
    return factory;
})();

if (typeof window === 'undefined') {
    var location_level_defaults = require('./defaults/location-level');
    module.exports = new BSRS_LOCATION_LEVEL_FACTORY(location_level_defaults);
} else {
    define('bsrs-ember/vendor/location_level_fixtures', ['exports', 'bsrs-ember/vendor/defaults/location-level'], function (exports, location_level_defaults) {
        'use strict';
        return new BSRS_LOCATION_LEVEL_FACTORY(location_level_defaults);
    });
}

