const FIRST_ID_COUNTRY = 1;
const FIRST_NAME_COUNTRY = 'Merica';

var country_defaults = {firstId: FIRST_ID_COUNTRY, firstName: FIRST_NAME_COUNTRY};

if (typeof window === 'undefined') {
    module.exports = country_defaults;
} else {
    define('bsrs-ember/vendor/country', ['exports'], function (exports) {
        'use strict';
        return country_defaults;
    });
}
