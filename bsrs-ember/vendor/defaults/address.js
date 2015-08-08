var BSRS_ADDRESS_DEFAULTS_OBJECT = (function() {
    var factory = function(country_defaults) {
        this.country_defaults = country_defaults;
    };
    factory.prototype.defaults = function() {
        return {
            idOne: '1ee82b8c-89bd-45a2-8d57-5b920c8b9786', 
            idTwo: '2cc82b8c-89bd-45a2-8d57-5b920c8b9786', 
            streetOne: 'Sky Park',
            streetTwo: '123 PB',
            cityOne: 'San Diego',
            cityTwo: 'San Diego',
            cityThree: 'Melbourne',
            stateOne: 1,
            stateTwo: 5,
            zipOne: '92123',
            zipTwo: '92100',
            countryOne: this.country_defaults.id,
            countryTwo: this.country_defaults.idTwo
        };
    };
    return factory;
})();

if (typeof window === 'undefined') {
    var country_defaults = require('../vendor/defaults/country');
    module.exports = new BSRS_ADDRESS_DEFAULTS_OBJECT(country_defaults).defaults();
} else {
    define('bsrs-ember/vendor/defaults/address', ['exports', 'bsrs-ember/vendor/defaults/country'], function (exports, country_defaults) {
        'use strict';
        return new BSRS_ADDRESS_DEFAULTS_OBJECT(country_defaults).defaults();
    });
}
