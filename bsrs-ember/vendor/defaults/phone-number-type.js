const OFFICE_PHONE_TYPE = 1;
const MOBILE_PHONE_TYPE = 2;
const MOBILE_PHONE_NAME = 'admin.phonenumbertype.mobile';
const OFFICE_PHONE_NAME = 'admin.phonenumbertype.office';

var phone_number_type_defaults = {officeType: OFFICE_PHONE_TYPE, officeName: OFFICE_PHONE_NAME, mobileType: MOBILE_PHONE_TYPE, mobileName: MOBILE_PHONE_NAME };

if (typeof window === 'undefined') {
    module.exports = phone_number_type_defaults;
} else {
    define('bsrs-ember/vendor/defaults/phone-number-type', ['exports'], function (exports) {
        'use strict';
        return phone_number_type_defaults;
    });
}
