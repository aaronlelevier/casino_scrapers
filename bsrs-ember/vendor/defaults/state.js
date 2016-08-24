var BSRS_STATE_DEFAULTS_OBJECT = (function() {
    var factory = function() {
    };
    factory.prototype.defaults = function() {
        return {
            idFive: 5,
            id: '634e9828-74d8-48fb-88af-44e9ec1cdab1',
            name: 'California',
            abbr: 'CA',
            idTwo: '634e9828-74d8-48fb-88af-44e9ec1cdab2',
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
