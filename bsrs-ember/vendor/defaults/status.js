var BSRS_STATUS_DEFAULTS_OBJECT = (function() {
    var factory = function() {
    };
    factory.prototype.defaults = function() {
        return {
            activeId: '88b54767-fa08-4960-abbb-4fc28cd7908b',
            activeName: 'admin.location.status.active',
            inactiveId: 'fba38ad1-ff6b-4f2d-8264-c0a4d7670927',
            inactiveName: 'admin.location.status.inactive',
            expiredId: '1a19181d-5a00-419f-940e-809e72b8a4e5',
            expiredName: 'admin.location.status.expired'
        };
    };
    return factory;
})();

if (typeof window === 'undefined') {
    module.exports = new BSRS_STATUS_DEFAULTS_OBJECT().defaults();
} else {
    define('bsrs-ember/vendor/defaults/status', ['exports'], function (exports) {
        'use strict';
        return new BSRS_STATUS_DEFAULTS_OBJECT().defaults();
    });
}
