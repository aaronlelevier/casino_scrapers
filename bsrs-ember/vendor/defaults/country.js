var BSRS_COUNTRY_DEFAULTS_OBJECT = (function() {
    var factory = function() {
    };
    factory.prototype.defaults = function() {
        return {
            id: '6f0cd1ac-d868-487f-9b82-04b9ffe5a973',
            idOne: '6f0cd1ac-d868-487f-9b82-04b9ffe5a973',
            idTwo: 'b14998cc-e565-4ef4-a9d9-d172dcb409d6',
            unusedId: 'g14998cc-e535-4ef4-k9d8-d174dcb409d7',
            name: 'Merica',
            nameOne: 'Merica',
            nameTwo: 'Canada',
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
