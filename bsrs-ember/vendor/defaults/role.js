var BSRS_ROLE_DEFAULTS_OBJECT = (function() {
    var factory = function() {
    };
    factory.prototype.defaults = function() {
        return {
            id: 'af34ee9b-833c-4f3e-a584-b6851d1e04b7',
            idTwo: 'fc258447-ebc2-499f-a304-d8cf98e32ba8', 
            role_type_contractor: 'Contractor', 
            role_type_general: 'General',
            name: 'Admin',
            namePut: 'Broom Pusher',
            location_level: 1,
            location_levelPut: 2,
            categories: []
        };
    };
    return factory;
})();

if (typeof window === 'undefined') {
    module.exports = new BSRS_ROLE_DEFAULTS_OBJECT().defaults();
} else {
    define('bsrs-ember/vendor/defaults/role', ['exports'], function (exports) {
        'use strict';
        return new BSRS_ROLE_DEFAULTS_OBJECT().defaults();
    });
}
