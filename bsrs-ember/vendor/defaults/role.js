var BSRS_ROLE_DEFAULTS_OBJECT = (function() {
    var factory = function(location_level) {
        this.location_level = location_level;
    };
    factory.prototype.defaults = function(location_level) {
        return {
            id: 'af34ee9b-833c-4f3e-a584-b6851d1e04b7',
            idTwo: 'fc258447-ebc2-499f-a304-d8cf98e32ba8', 
            roleTypeContractor: 'Third-Party', 
            roleTypeGeneral: 'Internal',
            name: 'Admin',
            namePut: 'Broom Pusher',
            locationLevel: location_level.get().id,
            categories: []
        };
    };
    return factory;
})();

if (typeof window === 'undefined') {
    var location_level = require('../../vendor/location_level_fixtures.js');
    module.exports = new BSRS_ROLE_DEFAULTS_OBJECT().defaults(location_level);
} else {
    define('bsrs-ember/vendor/defaults/role', ['exports', 'bsrs-ember/vendor/location_level_fixtures'], function (exports, location_level) {
        'use strict';
        return new BSRS_ROLE_DEFAULTS_OBJECT().defaults(location_level);
    });
}
