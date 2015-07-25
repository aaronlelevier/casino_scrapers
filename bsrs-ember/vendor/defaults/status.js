const ACTIVE_ID = 1;
const ACTIVE_NAME = 'Active';

const INACTIVE_ID = 2;
const INACTIVE_NAME = 'Inactive';

const EXPIRED_ID = 3;
const EXPIRED_NAME = 'Expired';

var status_list = {activeId: ACTIVE_ID, activeName: ACTIVE_NAME, inactiveId: INACTIVE_ID, inactiveName: INACTIVE_NAME, expiredId: EXPIRED_ID, expiredName: EXPIRED_NAME};

if (typeof window === 'undefined') {
    module.exports = status_list
} else {
    define('bsrs-ember/vendor/defaults/status', ['exports'], function (exports) {
        'use strict';
        return status_list;
    });
}
