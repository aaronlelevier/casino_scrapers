const BSRS_STATE_ID_ONE = 5;
const BSRS_STATE_NAME_ONE = 'California';
const BSRS_STATE_ABBR_ONE = 'CA';
const BSRS_STATE_ID_TWO = 2;
const BSRS_STATE_NAME_TWO = 'Alabama';
const BSRS_STATE_ABBR_TWO = 'AL';

var state_list = {id: BSRS_STATE_ID_ONE, name: BSRS_STATE_NAME_ONE, abbr: BSRS_STATE_ABBR_ONE, idTwo: BSRS_STATE_ID_TWO, nameTwo: BSRS_STATE_NAME_TWO, abbrTwo: BSRS_STATE_ABBR_TWO};

if (typeof window === 'undefined') {
    module.exports = state_list;
} else {
    define('bsrs-ember/vendor/defaults/state', ['exports'], function (exports) {
        'use strict';
        return state_list;
    });
}
