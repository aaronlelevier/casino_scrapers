const BSRS_CATEGORY_ID = '932t43cf-8fba-446a-4ec3-19778ce79990';
const BSRS_CATEGORY_ID_2 = '132543cf-bfba-426a-3fc9-17778cd79990';
const BSRS_CATEGORY_NAME = 'Repair';
const BSRS_CATEGORY_NAME_2 = 'Maintenance';
const BSRS_CATEGORY_NAME_3 = 'Loss Prevention';
const BSRS_CATEGORY_STATUS = 'Active';

var BSRS_CATEGORY_DEFAULTS = {id: BSRS_CATEGORY_ID, idTwo: BSRS_CATEGORY_ID_2, name: BSRS_CATEGORY_NAME, nameTwo: BSRS_CATEGORY_NAME_2, nameThree: BSRS_CATEGORY_NAME_3, status: BSRS_CATEGORY_STATUS};

if (typeof window === 'undefined') {
    module.exports = BSRS_CATEGORY_DEFAULTS;
} else {
    define('bsrs-ember/vendor/defaults/category', ['exports'], function (exports) {
        'use strict';
        return BSRS_CATEGORY_DEFAULTS;
    });
}
