var BSRS_STORE_STATUS_DEFAULTS_OBJECT = (function() {
    var factory = function() {
    };
    factory.prototype.defaults = function() {
        return {
            activeId: '38b54567-da02-4961-abdb-4fw28cy7998b',
            activeName: 'Active',
            inactiveName: 'Inactive'
        };
    };
    return factory;
})();

if (typeof window === 'undefined') {
    module.exports = new BSRS_STORE_STATUS_DEFAULTS_OBJECT().defaults();
} else {
    define('bsrs-ember/vendor/defaults/store-status', ['exports'], function (exports) {
        'use strict';
        return new BSRS_STORE_STATUS_DEFAULTS_OBJECT().defaults();
    });
}

