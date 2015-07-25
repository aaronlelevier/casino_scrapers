const FIRST_ID_STATE = 5;
const FIRST_NAME_STATE = 'California';
const FIRST_ABBR = 'CA';

var state_list = {firstId: FIRST_ID_STATE, firstName: FIRST_NAME_STATE, firstAbbr: FIRST_ABBR};

if (typeof window === 'undefined') {
    module.exports = state_list;
} else {
    define('bsrs-ember/vendor/defaults/state', ['exports'], function (exports) {
        'use strict';
        return state_list;
    });
}
