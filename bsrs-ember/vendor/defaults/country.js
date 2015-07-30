var BSRS_COUNTRY_DEFAULTS_OBJECT = (function() {
    var factory = function() {
    };
    factory.prototype.defaults = function() {
        return {
            id: '6f0cd1ac-d868-487f-9b82-04b9ffe5a973',
            name: 'Merica',
            idTwo: 'b14998cc-e565-4ef4-a9d9-d172dcb409d6', 
            nameTwo: 'Canada' 
        }
    };
    return factory;
})();

if (typeof window === 'undefined') {
    module.exports = new BSRS_COUNTRY_DEFAULTS_OBJECT().defaults();
} else {
    define('bsrs-ember/vendor/defaults/country', ['exports'], function (exports) {
        'use strict';
        return new BSRS_COUNTRY_DEFAULTS_OBJECT().defaults();
    });
}
