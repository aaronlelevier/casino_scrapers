const BSRS_UUID_VALUE = 'abc123'; //update to a true guid after pre/re factor

var uuid_data = {value: BSRS_UUID_VALUE};

if (typeof window === 'undefined') {
    module.exports = uuid_data;
} else {
    define('bsrs-ember/vendor/defaults/uuid', ['exports'], function (exports) {
        'use strict';
        return uuid_data;
    });
}
