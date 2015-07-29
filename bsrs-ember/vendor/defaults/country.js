const BSRS_FIRST_ID_COUNTRY = '6f0cd1ac-d868-487f-9b82-04b9ffe5a973';
const BSRS_FIRST_NAME_COUNTRY = 'Merica';

const BSRS_COUNTRY_TWO_ID = 'b14998cc-e565-4ef4-a9d9-d172dcb409d6';
const BSRS_COUNTRY_TWO_NAME = 'Canada';

var country_defaults = {id: BSRS_FIRST_ID_COUNTRY, name: BSRS_FIRST_NAME_COUNTRY, idTwo: BSRS_COUNTRY_TWO_ID, nameTwo: BSRS_COUNTRY_TWO_NAME};

if (typeof window === 'undefined') {
    module.exports = country_defaults;
} else {
    define('bsrs-ember/vendor/defaults/country', ['exports'], function (exports) {
        'use strict';
        return country_defaults;
    });
}
