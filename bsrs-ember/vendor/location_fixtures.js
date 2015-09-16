var BSRS_LOCATION_FACTORY = (function() {
    var factory = function(location_defaults, location_level_defaults, location_level_fixtures) {
        this.location_defaults = location_defaults;
        this.location_level_defaults = location_level_defaults;
        this.location_level_fixtures = location_level_fixtures;
    };
    factory.prototype.get = function(i) {
        return {
            id: this.location_defaults.idOne,
            name: this.location_defaults.storeName
        }
    },
    factory.prototype.generate = function(i) {
        return {
            id: i,
            name : this.location_defaults.baseStoreName,
            number : this.location_defaults.storeNumber,
            status: this.location_defaults.status,
            location_level: this.location_level_fixtures.detail(),
            children: [],
            parents: []
        }
    };
    factory.prototype.list = function() {
        var response = [];
        for (var i=1; i <= 5; i++) {
            var uuid = '232z46cf-9fbb-456z-4hc3-59728vu30990';
            var location = this.generate(uuid + i);
            location.name = location.name + i;
            response.push(location);
        }
        return {'count':5,'next':null,'previous':null,'results': response};
    };
    factory.prototype.empty = function() {
        return {'count':0,'next':null,'previous':null,'results': []};
    };
    factory.prototype.detail = function(i) {
        return this.generate(this.location_defaults.idOne);
    };
    factory.prototype.put = function(location) {
        var response = this.generate(location.id);
        response.location_level = this.location_level_fixtures.detail().id;
        for(var key in location) {
            response[key] = location[key];
        }
        return response;
    };
    return factory;
})();

if (typeof window === 'undefined') {
    var location_defaults = require('../vendor/defaults/location');
    var location_level_fixtures = require('../vendor/location_level_fixtures');
    var location_level_defaults = require('../vendor/defaults/location-level');
    module.exports = new BSRS_LOCATION_FACTORY(location_defaults, location_level_defaults, location_level_fixtures);
} else {
    define('bsrs-ember/vendor/location_fixtures', ['exports', 'bsrs-ember/vendor/defaults/location', 'bsrs-ember/vendor/defaults/location-level', 'bsrs-ember/vendor/location_level_fixtures'], function (exports, location_defaults, location_level_defaults, location_level_fixtures) {
        'use strict';
        return new BSRS_LOCATION_FACTORY(location_defaults, location_level_defaults, location_level_fixtures);
    });
}

