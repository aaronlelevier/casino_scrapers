const USD_ID = '2e92dc64-8646-4ef4-823f-407b5a3a2853';
const USD_SYMBOL = '$';
const USD_NAME = 'US Dollar';
const USD_DECIMAL_DIGITS = 2;
const USD_CODE = 'USD';
const USD_NAME_PLURAL = 'US dollars';
const USD_ROUNDING = 0;
const USD_SYMBOL_NATIVE = '$';

var currency_list = {id: USD_ID, symbol: USD_SYMBOL, name: USD_NAME, decimal_digits: USD_DECIMAL_DIGITS,
    code: USD_CODE, name_plural: USD_NAME_PLURAL, rounding: USD_ROUNDING, symbol_native: USD_SYMBOL_NATIVE};

if (typeof window === 'undefined') {
    module.exports = currency_list
} else {
    define('bsrs-ember/vendor/currencies', ['exports'], function (exports) {
        'use strict';
        return currency_list;
    });
}
