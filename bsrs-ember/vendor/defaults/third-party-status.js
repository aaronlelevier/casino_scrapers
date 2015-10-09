var BSRS_THIRD_PARTY_STATUS_DEFAULTS_OBJECT = (function() {
    var factory = function() {
    };
    factory.prototype.defaults = function() {
        return {
            active: '730c3a61-2e1b-4443-80e7-82ac8bbf3713',
            activeName: 'admin.third_party.status.active',
            inactive: '4bbb062a-78e6-4a53-8f55-ccabeb11e94a',
            inactiveName: 'admin.third_party.status.inactive',
        };
    };
    return factory;
})();

if (typeof window === 'undefined') {
    module.exports = new BSRS_THIRD_PARTY_STATUS_DEFAULTS_OBJECT().defaults();
} else {
    define('bsrs-ember/vendor/defaults/third-party-status', ['exports'], function (exports) {
        'use strict';
        return new BSRS_THIRD_PARTY_STATUS_DEFAULTS_OBJECT().defaults();
    });
}
