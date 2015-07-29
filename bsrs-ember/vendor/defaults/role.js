const BSRS_ROLE_ONE_ID = 'af34ee9b-833c-4f3e-a584-b6851d1e04b7';
const BSRS_ROLE_ONE_NAME = 'Admin';

const BSRS_ROLE_TWO_ID = 'fc258447-ebc2-499f-a304-d8cf98e32ba8';
const BSRS_ROLE_TWO_NAME = 'Guest';

var roles_list = {id: BSRS_ROLE_ONE_ID, name: BSRS_ROLE_ONE_NAME, idTwo: BSRS_ROLE_TWO_ID, nameTwo: BSRS_ROLE_TWO_NAME};

if (typeof window === 'undefined') {
    module.exports = roles_list
} else {
    define('bsrs-ember/vendor/defaults/role', ['exports'], function (exports) {
        'use strict';
        return roles_list;
    });
}
