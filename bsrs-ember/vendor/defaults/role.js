var BSRS_ROLE_DEFAULTS_OBJECT = (function() {
    var factory = function() {
    };
    factory.prototype.defaults = function(location_level) {
        return {
            id: 'af34ee9b-833c-4f3e-a584-b6851d1e04b7',
            idTwo: 'fc258447-ebc2-499f-a304-d8cf98e32ba8', 
            roleTypeContractor: 'Third-Party', 
            roleTypeGeneral: 'Internal',
            name: 'Admin',
            namePut: 'Broom Pusher',
            locationLevel: location_level.get(),
            categories: []
        };
    };
    return factory;
})();

if (typeof window === 'undefined') {
    module.exports = new BSRS_ROLE_DEFAULTS_OBJECT().defaults();
} else {
    define('bsrs-ember/vendor/defaults/role', ['exports', 'bsrs-ember/vendor/location_level_fixtures'], function (exports, location_level) {
        'use strict';
        return new BSRS_ROLE_DEFAULTS_OBJECT().defaults(location_level);
    });
}
