var BSRS_PERSON_LOCATION_DEFAULTS_OBJECT = (function() {
    var factory = function() {
    };
    factory.prototype.defaults = function() {
        return {
            idOne: 1,
            idTwo: 2,
            idThree: 99,
            idFour: 98
        };
    };
    return factory;
})();

if (typeof window === 'undefined') {
    module.exports = new BSRS_PERSON_LOCATION_DEFAULTS_OBJECT().defaults();
} else {
    define('bsrs-ember/vendor/defaults/person-location', ['exports'], function (exports) {
        'use strict';
        return new BSRS_PERSON_LOCATION_DEFAULTS_OBJECT().defaults();
    });
}
