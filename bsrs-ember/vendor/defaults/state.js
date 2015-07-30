var BSRS_STATE_DEFAULTS_OBJECT = (function() {
    var factory = function() {
    };
    factory.prototype.defaults = function() {
        return {
            id: 5,
            name: 'California',
            abbr: 'CA',
            idTwo: 2,
            nameTwo: 'Alabama',
            abbrTwo: 'AL',

        }
    };
    return factory;
})();

if (typeof window === 'undefined') {
    module.exports = new BSRS_STATE_DEFAULTS_OBJECT().defaults();
} else {
    define('bsrs-ember/vendor/defaults/state', ['exports'], function (exports) {
        'use strict';
        return new BSRS_STATE_DEFAULTS_OBJECT().defaults();
    });
}
