const ACTIVE_ID = '88b54767-fa08-4960-abbb-4fc28cd7908b';
const ACTIVE_NAME = 'Active';

const INACTIVE_ID = 'fba38ad1-ff6b-4f2d-8264-c0a4d7670927';
const INACTIVE_NAME = 'Inactive';

const EXPIRED_ID = '1a19181d-5a00-419f-940e-809e72b8a4e5';
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
