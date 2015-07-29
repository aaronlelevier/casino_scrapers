/* PUT DATA */
const BSRS_PERSON_ID_PUT = '263126de-5fzx-315a-8bc3-09778cd78841';
const BSRS_PERSON_USERNAME_PUT = 'llcoolj';
const BSRS_PERSON_FIRST_NAME_PUT  = 'Ice';
const BSRS_PERSON_MIDDLE_INITIAL_PUT  = 'F\'in';
const BSRS_PERSON_LAST_NAME_PUT  = 'Cube';
const BSRS_PERSON_EMP_NUMBER_PUT  = '1122';
const BSRS_PERSON_AUTH_AMOUNT_PUT  = '0.000';
const BSRS_PERSON_TITLE_PUT  = 'mastermind';

var BSRS_PERSON_DEFAULT_VALUES_PUT = {id: BSRS_PERSON_ID_PUT, username: BSRS_PERSON_USERNAME_PUT, first_name: BSRS_PERSON_FIRST_NAME_PUT, middle_initial: BSRS_PERSON_MIDDLE_INITIAL_PUT, last_name: BSRS_PERSON_LAST_NAME_PUT, emp_number: BSRS_PERSON_EMP_NUMBER_PUT, title: BSRS_PERSON_TITLE_PUT, auth_amount: BSRS_PERSON_AUTH_AMOUNT_PUT };

if (typeof window === 'undefined') {
    module.exports = BSRS_PERSON_DEFAULT_VALUES_PUT;
} else {
    define('bsrs-ember/vendor/defaults/person-put', ['exports'], function (exports) {
        'use strict';
        return BSRS_PERSON_DEFAULT_VALUES_PUT;
    });
}
