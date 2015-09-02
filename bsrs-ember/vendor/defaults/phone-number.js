const BSRS_PHONE_NUMBER_ID = 1;
const BSRS_PHONE_NUMBER_ID_TWO = 2;
const BSRS_PHONE_NUMBER_ID_THREE = 3;
const BSRS_PHONE_NUMBER_PUT = 3;
const BSRS_PHONE_NUMBER_ONE = '858-715-5026';
const BSRS_PHONE_NUMBER_TWO = '858-715-5056';
const BSRS_PHONE_NUMBER_THREE = '515-717-9876';
var phone_number_defaults = {id: BSRS_PHONE_NUMBER_ONE, idTwo: BSRS_PHONE_NUMBER_TWO, idPut: BSRS_PHONE_NUMBER_PUT, numberOne: BSRS_PHONE_NUMBER_ONE, numberTwo: BSRS_PHONE_NUMBER_TWO, idThree: BSRS_PHONE_NUMBER_ID_THREE, numberThree: BSRS_PHONE_NUMBER_THREE};

if (typeof window === 'undefined') {
    module.exports = phone_number_defaults;
} else {
    define('bsrs-ember/vendor/defaults/phone-number', ['exports'], function (exports) {
        'use strict';
        return phone_number_defaults;
    });
}

