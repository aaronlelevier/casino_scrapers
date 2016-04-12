var BSRS_OPTIONS_DEFAULTS_OBJECT = (function() {
    var factory = function() {
    };
    factory.prototype.defaults = function() {
        return {
            idOne: 'b12695d0-a82d-451f-a9c3-d87aaa47ac44',
            idTwo: 'b12695d0-a82d-451f-a9c3-d87aaa47ac45',
            idThree: 'b12695d0-a82d-451f-a9c3-d87aaa47ac46',
            textOne: 'yes',
            textTwo: 'no',
            textThree: 'maybe',
            orderOne: 0,
            orderTwo: 1,
            orderThree: 2
        };
    };
    return factory;
})();

if (typeof window === 'undefined') {
    module.exports = new BSRS_OPTIONS_DEFAULTS_OBJECT().defaults();
} else {
    define('bsrs-ember/vendor/defaults/option',
        ['exports'],
        function (exports) {
        'use strict';
        return new BSRS_OPTIONS_DEFAULTS_OBJECT().defaults();
    });
}
