var BSRS_CURRENCY_DEFAULTS_OBJECT = (function() {
    var factory = function() {
    };
    factory.prototype.defaults = function() {
        return {
            id: '2e92dc64-8646-4ef4-823f-407b5a3a2853',
            symbol: '$',
            name: 'US Dollar',
            decimal_digits: 2,
            code: 'USD', 
            name_plural: 'US dollars',
            rounding: 0,
            symbol_native: '$'
        };
    };
    return factory;
})();

if (typeof window === 'undefined') {
    module.exports = new BSRS_CURRENCY_DEFAULTS_OBJECT().defaults();
} else {
    define('bsrs-ember/vendor/currencies', ['exports'], function (exports) {
        'use strict';
        return new BSRS_CURRENCY_DEFAULTS_OBJECT().defaults();
    });
}
