var BSRS_LOCATION_FACTORY = (function() {
    var factory = function(location_defaults) {
        this.location_defaults = location_defaults;
    };
    factory.prototype.generate = function(i) {
        return {
            id: i,
            name : this.location_defaults.storeName,
            number : this.location_defaults.storeNumber,
            //location_level: this.location_defaults.locationLevel,
            status: this.location_defaults.status,
        }
    };
    factory.prototype.list = function() {
        var response = [];
        for (var i=1; i <= 5; i++) {
            var uuid = '232z46cf-9fbb-456z-4hc3-59728vu30990';
            response.push(this.generate(uuid + i));
        }
        return {'count':3,'next':null,'previous':null,'results': response};
    };
    factory.prototype.empty = function() {
        return {'count':3,'next':null,'previous':null,'results': []};
    };
    factory.prototype.detail = function(i) {
        var location = this.generate(i);
        return location;
    };
    factory.prototype.put = function(location) {
        var response = this.generate(location.id);
        for(var key in location) {
            response[key] = location[key];
        }
        return response;
    };
    return factory;
})();

if (typeof window === 'undefined') {
    var location_defaults = require('../vendor/defaults/location');
    module.exports = new BSRS_LOCATION_FACTORY(location_defaults);
} else {
    define('bsrs-ember/vendor/location_fixtures', ['exports', 'bsrs-ember/vendor/defaults/location'], function (exports, location_defaults) {
        'use strict';
        return new BSRS_LOCATION_FACTORY(location_defaults);
    });
}

