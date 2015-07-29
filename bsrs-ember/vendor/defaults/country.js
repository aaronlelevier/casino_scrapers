const FIRST_ID_COUNTRY = '6f0cd1ac-d868-487f-9b82-04b9ffe5a973';
const FIRST_NAME_COUNTRY = 'Merica';

var country_defaults = {firstId: FIRST_ID_COUNTRY, firstName: FIRST_NAME_COUNTRY};

if (typeof window === 'undefined') {
    module.exports = country_defaults;
} else {
    define('bsrs-ember/vendor/defaults/country', ['exports'], function (exports) {
        'use strict';
        return country_defaults;
    });
}
