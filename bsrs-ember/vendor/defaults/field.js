var BSRS_FIELDS_DEFAULTS_OBJECT = (function() {
    var factory = function() {
    };
    factory.prototype.defaults = function() {
        return {
            idOne: 'a12695d0-a82d-451f-a9c3-d87aaa47ac44',
            idTwo: 'a12695d0-a82d-451f-a9c3-d87aaa47ac45',
            idThree: 'a12695d0-a82d-451f-a9c3-d87aaa47ac46',
            labelOne: 'name',
            labelTwo: 'age',
            labelThree: 'address',
            typeOne: 'text',
            typeTwo: 'number',
            typeThree: 'textarea',
            requiredOne: false,
            requiredTwo: true
        };
    };
    return factory;
})();

if (typeof window === 'undefined') {
    module.exports = new BSRS_FIELDS_DEFAULTS_OBJECT().defaults();
} else {
    define('bsrs-ember/vendor/defaults/field',
        ['exports'],
        function (exports) {
        'use strict';
        return new BSRS_FIELDS_DEFAULTS_OBJECT().defaults();
    });
}

