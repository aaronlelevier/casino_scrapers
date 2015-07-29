const BSRS_ROLE_ID = '929563yf-6fea-423y-8bc3-19788cd79951';
const BSRS_ROLE_TYPE = 1;
const BSRS_ROLE_NAME = 'System Administrator';
const BSRS_ROLE_NAME_PUT = 'Broom Pusher';
const BSRS_ROLE_LOCATION_LEVEL = 1;
const BSRS_ROLE_CATEGORY = 1;
const BSRS_ROLE_CATEGORY_PUT = 2;
const BSRS_ROLE_LOCATION_LEVEL_PUT = 2;

var BSRS_ROLE_DEFAULTS = {id: BSRS_ROLE_ID, name: BSRS_ROLE_NAME, namePut: BSRS_ROLE_NAME_PUT, location_level: BSRS_ROLE_LOCATION_LEVEL, location_levelPut: BSRS_ROLE_LOCATION_LEVEL_PUT, category: BSRS_ROLE_CATEGORY, categoryPut: BSRS_ROLE_CATEGORY_PUT};

if (typeof window === 'undefined') {
    module.exports = BSRS_ROLE_DEFAULTS;
} else {
    define('bsrs-ember/vendor/defaults/role', ['exports'], function (exports) {
        'use strict';
        return BSRS_ROLE_DEFAULTS;
    });
}
