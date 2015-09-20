const BSRS_PERSON_ID = '139543cf-8fea-426a-8bc3-09778cd79901';
const BSRS_PERSON_ORIG_USERNAME = 'mgibson';
const BSRS_PERSON_USERNAME = BSRS_PERSON_ORIG_USERNAME + '1';
const BSRS_PERSON_PASSWORD = '1!';
const BSRS_PERSON_EMAIL = [];
const BSRS_PERSON_ORIG_FIRST_NAME = 'Mel';
const BSRS_PERSON_FIRST_NAME = BSRS_PERSON_ORIG_FIRST_NAME + '1';
const BSRS_PERSON_MIDDLE_INITIAL = 'B';
const BSRS_PERSON_ORIG_LAST_NAME = 'Gibson';
const BSRS_PERSON_LAST_NAME = BSRS_PERSON_ORIG_LAST_NAME + '1';
const BSRS_PERSON_employee_id = '5063';
const BSRS_PERSON_AUTH_AMOUNT = '50000.00';
const BSRS_PERSON_ORIG_TITLE = 'MVP';
const BSRS_PERSON_TITLE = '1 ' + BSRS_PERSON_ORIG_TITLE;
const BSRS_PERSON_LOCATION = '';
const BSRS_PERSON_PHONE_NUMBERS = [];
const BSRS_PERSON_ADDRESSES = [];
const BSRS_PERSON_UNUSED_ID = 'cadba3ba-a533-44e0-ab1f-57cc1b052138';

var BSRS_PERSON_DEFAULTS_OBJECT = (function() {
    var factory = function(role_defaults, status_defaults, currency_defaults) {
        this.role_defaults = role_defaults;
        this.status_defaults = status_defaults;
        this.currency_defaults = currency_defaults;
    };
    factory.prototype.defaults = function() {
        return {
            id: BSRS_PERSON_ID,
            username: BSRS_PERSON_USERNAME,
            password: BSRS_PERSON_PASSWORD,
            emails: BSRS_PERSON_EMAIL,
            first_name: BSRS_PERSON_FIRST_NAME,
            middle_initial: BSRS_PERSON_MIDDLE_INITIAL,
            last_name: BSRS_PERSON_LAST_NAME,
            fullname: BSRS_PERSON_FIRST_NAME + " " + BSRS_PERSON_LAST_NAME,
            role: this.role_defaults.idOne,
            status: this.status_defaults.activeId,
            phone_numbers: BSRS_PERSON_PHONE_NUMBERS,
            addresses: BSRS_PERSON_ADDRESSES,
            location: BSRS_PERSON_LOCATION,
            employee_id: BSRS_PERSON_employee_id,
            title: BSRS_PERSON_TITLE,
            auth_amount: BSRS_PERSON_AUTH_AMOUNT,
            auth_currency: this.currency_defaults.id,
            locale: 'en',
            locale2: 'es',
            locale_id: 'a7ae2835-ee7c-4604-92f7-045f3994936e',
            locale2_id: '51905ba8-024f-4739-ae5c-2d90ffc3f726',
            unusedId: BSRS_PERSON_UNUSED_ID
        };
    };
    return factory;
})();

if (typeof window === 'undefined') {
    var role_defaults = require('./role');
    var status_defaults = require('./status');
    var currency_defaults = require('./currencies');
    module.exports = new BSRS_PERSON_DEFAULTS_OBJECT(role_defaults, status_defaults, currency_defaults).defaults();
} else {
    define('bsrs-ember/vendor/defaults/person', ['exports', 'bsrs-ember/vendor/defaults/role',
                                                'bsrs-ember/vendor/defaults/status',
                                                'bsrs-ember/vendor/defaults/currencies'],
    function (exports, role_defaults, status_defaults, currency_defaults) {
        'use strict';
        return new BSRS_PERSON_DEFAULTS_OBJECT(role_defaults, status_defaults, currency_defaults).defaults();
    });
}
