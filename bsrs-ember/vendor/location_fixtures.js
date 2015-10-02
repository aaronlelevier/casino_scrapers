var BSRS_LOCATION_FACTORY = (function() {
    var factory = function(location_defaults, location_level_defaults, location_level_fixtures) {
        this.location_defaults = location_defaults;
        this.location_level_defaults = location_level_defaults;
        this.location_level_fixtures = location_level_fixtures.default || location_level_fixtures;
    };
    factory.prototype.get = function(i) {
        return {
            id: i || this.location_defaults.idOne,
            name: this.location_defaults.storeName,
            number: this.location_defaults.storeName,
            location_level: this.location_level_fixtures.detail()
        }
    },
    factory.prototype.generate = function(i) {
        var id = i || this.location_defaults.idOne;
        return {
            id: id,
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
        for (var i=1; i <= 10; i++) {
            var uuid = '232z46cf-9fbb-456z-4hc3-59728vu3099';
            if (i < 10) {
                uuid = uuid + '0' + i;
            } else{
                uuid = uuid + i;
            }
            var location = this.generate(uuid);
            location.name = location.name + i;
            location.number = location.number + i;
            response.push(location);
        }
        //we do a reverse order sort here to verify a real sort occurs in the component
        var sorted = response.sort(function(a,b) {
            return b.id - a.id;
        });
        return {'count':19,'next':null,'previous':null,'results': sorted};
    };
    factory.prototype.list_two = function() {
        var response = [];
        for (var i=11; i <= 19; i++) {
            var uuid = '232z46cf-9fbb-456z-4hc3-59728vu3099';
            var location = this.generate(uuid + i);
            location.name = 'vzoname' + i;
            location.number = 'sconumber' + i;
            response.push(location);
        }
        return {'count':19,'next':null,'previous':null,'results': response};
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
    var objectAssign = require('object-assign');
    var mixin = require('../vendor/mixin');
    var location_defaults = require('../vendor/defaults/location');
    var location_level_fixtures = require('../vendor/location_level_fixtures');
    var location_level_defaults = require('../vendor/defaults/location-level');
    objectAssign(BSRS_LOCATION_FACTORY.prototype, mixin.prototype);
    module.exports = new BSRS_LOCATION_FACTORY(location_defaults, location_level_defaults, location_level_fixtures);
} else {
    define('bsrs-ember/vendor/location_fixtures', ['exports', 'bsrs-ember/vendor/defaults/location', 'bsrs-ember/vendor/defaults/location-level', 'bsrs-ember/vendor/location_level_fixtures', 'bsrs-ember/vendor/mixin'], function (exports, location_defaults, location_level_defaults, location_level_fixtures, mixin) {
        'use strict';
        Object.assign(BSRS_LOCATION_FACTORY.prototype, mixin.prototype);
        var Factory = new BSRS_LOCATION_FACTORY(location_defaults, location_level_defaults, location_level_fixtures);
        return {default: Factory};
    });
}

