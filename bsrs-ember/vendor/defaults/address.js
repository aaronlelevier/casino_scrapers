const BSRS_ID_1 = 1; 
const BSRS_ID_1_PUT = 3; 
const BSRS_STREET_1 = 'Sky Park'; 
const BSRS_STREET_2 = '123 PB';
const BSRS_CITY_1 = 'San Diego'; 
const BSRS_CITY_2 = 'San Diego';
const BSRS_STATE_1 = 1; 
const BSRS_STATE_2 = 5;
const BSRS_ZIPCODE_1 = '92123'; 
const BSRS_ZIPCODE_2 = '92100';
const BSRS_COUNTRY_PK_1 = 1; 
const BSRS_COUNTRY_PK_2 = 1;

var address_defaults = {id: BSRS_ID_1, streetOne: BSRS_STREET_1, streetTwo: BSRS_STREET_2, cityOne: BSRS_CITY_1, cityTwo: BSRS_CITY_2, stateOne: BSRS_STATE_1, stateTwo: BSRS_STATE_2, zipOne: BSRS_ZIPCODE_1, zipTwo: BSRS_ZIPCODE_2, countryOne: BSRS_COUNTRY_PK_1, countryTwo: BSRS_COUNTRY_PK_2};

if (typeof window === 'undefined') {
    module.exports = address_defaults;
} else {
    define('bsrs-ember/vendor/defaults/address', ['exports'], function (exports) {
        'use strict';
        return address_defaults;
    });
}
