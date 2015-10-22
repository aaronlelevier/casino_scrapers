var BSRS_THIRD_PARTY_STATUS_DEFAULTS_OBJECT = (function() {
    var factory = function(status) {
        this.status = status;
    };
    factory.prototype.defaults = function() {
        return {
            active: this.status.activeId,
            activeName: 'admin.third_party.status.active',
            inactive: '4bbb062a-78e6-4a53-8f55-ccabeb11e94a',
            inactiveName: 'admin.third_party.status.inactive',
        };
    };
    return factory;
})();

if (typeof window === 'undefined') {
    var status = require('./status');
    module.exports = new BSRS_THIRD_PARTY_STATUS_DEFAULTS_OBJECT(status).defaults();
} else {
    define('bsrs-ember/vendor/defaults/third-party-status', ['exports', 'bsrs-ember/vendor/defaults/status'], function (exports, status) {
        'use strict';
        return new BSRS_THIRD_PARTY_STATUS_DEFAULTS_OBJECT(status).defaults();
    });
}
