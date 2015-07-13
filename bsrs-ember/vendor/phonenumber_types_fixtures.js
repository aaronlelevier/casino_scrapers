var PhoneNumberTypes = [
    {
        id: 1,
        name: 'admin.phonenumbertype.office'
    },
    {
        id: 2,
        name: 'admin.phonenumbertype.mobile'
    }
];

if (typeof window === 'undefined') {
    module.exports = PhoneNumberTypes; 
} else {
    define('bsrs-ember/vendor/phonenumber_types_fixtures', ['exports'], function (exports) {
        'use strict';
        return PhoneNumberTypes;
    });
}

