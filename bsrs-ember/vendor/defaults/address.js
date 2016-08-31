var BSRS_ADDRESS_DEFAULTS_OBJECT = (function() {
    var factory = function(addressType, state, country) {
        this.addressType = addressType;
        this.state = state;
        this.country = country;
    };
    factory.prototype.defaults = function() {
        return {
            idOne: '1ee82b8c-89bd-45a2-8d57-5b920c8b9786', 
            idTwo: '2cc82b8c-89bd-45a2-8d57-5b920c8b9786', 
            idThree: '2cc82b8c-89bd-45a2-8d57-5b920c8b9787',
            streetOne: 'Sky Park',
            streetTwo: '123 PB',
            streetThree: 'Milwaukee Way',
            cityOne: 'San Diego',
            cityTwo: 'San Diego',
            cityThree: 'Melbourne',
            zipOne: '92123',
            zipTwo: '92100',
            zipThree: '55666',
            typeOne: this.addressType.officeId,
            typeTwo: this.addressType.shippingId,
            stateOne: this.state.id,
            stateTwo: this.state.idTwo,
            stateThree: this.state.idThree,
            countryOne: this.country.id,
            countryTwo: this.country.idTwo
        };
    };
    return factory;
})();

if (typeof window === 'undefined') {
    var addressType = require('./address-type');
    var state = require('./state');
    var country = require('./country');
    module.exports = new BSRS_ADDRESS_DEFAULTS_OBJECT(addressType, state, country).defaults();
} else {
    define('bsrs-ember/vendor/defaults/address',
        ['exports',
        'bsrs-ember/vendor/defaults/address-type',
        'bsrs-ember/vendor/defaults/state',
        'bsrs-ember/vendor/defaults/country'],
        function (exports, addressType, state, country) {
        'use strict';
        return new BSRS_ADDRESS_DEFAULTS_OBJECT(addressType, state, country).defaults();
    });
}
