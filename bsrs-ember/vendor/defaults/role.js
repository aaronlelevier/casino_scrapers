const BSRS_ROLE_ID = '929562yf-6fea-423y-8bc3-19788cd79951';
const BSRS_ROLE_ID_TWO = 'fc258447-ebc2-499f-a304-d8cf98e32ba8';
const BSRS_ROLE_TYPE_CONTRACTOR = 'Contractor';
const BSRS_ROLE_TYPE_GENERAL = 'General';
const BSRS_ROLE_NAME = 'System Administrator';
const BSRS_ROLE_NAME_PUT = 'Broom Pusher';
const BSRS_ROLE_LOCATION_LEVEL = 1;
const BSRS_ROLE_CATEGORY = 1;
const BSRS_ROLE_CATEGORY_PUT = 2;
const BSRS_ROLE_LOCATION_LEVEL_PUT = 2;

var BSRS_ROLE_DEFAULTS = {id: BSRS_ROLE_ID, idTwo: BSRS_ROLE_ID_TWO,  name: BSRS_ROLE_NAME, namePut: BSRS_ROLE_NAME_PUT, role_type_contractor: BSRS_ROLE_TYPE_CONTRACTOR, role_type_general: BSRS_ROLE_TYPE_GENERAL,
    location_level: BSRS_ROLE_LOCATION_LEVEL, location_levelPut: BSRS_ROLE_LOCATION_LEVEL_PUT, 
    category: BSRS_ROLE_CATEGORY, categoryPut: BSRS_ROLE_CATEGORY_PUT};

if (typeof window === 'undefined') {
    module.exports = BSRS_ROLE_DEFAULTS;
} else {
    define('bsrs-ember/vendor/defaults/role', ['exports'], function (exports) {
        'use strict';
        return BSRS_ROLE_DEFAULTS;
    });
}
