var BSRS_PERSON_PUT_DEFAULTS_OBJECT = (function() {
    var factory = function(currency_defaults) {
        this.currency_defaults = currency_defaults
    };
    factory.prototype.defaults = function() {
        return {
            id: '263126de-5fzx-315a-8bc3-09778cd78841',
            username: 'llcoolj',
            password: '',
            first_name: 'Ice',
            middle_initial: 'F',
            last_name: 'Cube',
            fullname: 'Ice F\'in Cube',
            employee_id: '1122',
            auth_amount: '0.00',
            auth_currency: this.currency_defaults.id,
            title: 'mastermind',
            locale: 'en'
        };
    };
    return factory;
})();


if (typeof window === 'undefined') {
    var currency_defaults = './currency';
    module.exports = new BSRS_PERSON_PUT_DEFAULTS_OBJECT(currency_defaults).defaults();
} else {
    define('bsrs-ember/vendor/defaults/person-put', ['exports', 'bsrs-ember/vendor/defaults/currency'], function (exports, currency_defaults) {
        'use strict';
        return new BSRS_PERSON_PUT_DEFAULTS_OBJECT(currency_defaults).defaults();
    });
}
