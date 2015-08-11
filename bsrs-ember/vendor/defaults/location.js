var BSRS_LOCATION_DEFAULTS_OBJECT = (function() {
    var factory = function(location_status, location_level) {
        this.location_status = location_status;
        this.location_level = location_level;
    };
    factory.prototype.defaults = function() {
        return {
            idOne: '232z46cf-9fbb-456z-4hc3-59728vu309901',
            idTwo: '232543cf-cfby-129a-3fc9-1t771c372509',
            storeName: 'ABC123',
            storeNameTwo: 'DEF456',
            storeNumber: '123zz',
            storeNumberTwo: '456zz',
            status: this.location_status.openId,
            location_level: this.location_level.idOne
        };
    };
    return factory;
})();

if (typeof window === 'undefined') {
    var location_level = require('./location-level');
    var location_status = require('./location-status');
    module.exports = new BSRS_LOCATION_DEFAULTS_OBJECT(location_status, location_level).defaults();
} else {
    define('bsrs-ember/vendor/defaults/location', ['exports', 'bsrs-ember/vendor/defaults/location-status', 'bsrs-ember/vendor/defaults/location-level'], function (exports, location_status, location_level) {
        'use strict';
        return new BSRS_LOCATION_DEFAULTS_OBJECT(location_status, location_level).defaults();
    });
}
