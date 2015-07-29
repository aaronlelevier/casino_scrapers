const OFFICE_PHONE_TYPE = '2bff27c7-ca0c-463a-8e3b-6787dffbe7de';
const MOBILE_PHONE_TYPE = '9416c657-6f96-434d-aaa6-0c867aff3270';
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
