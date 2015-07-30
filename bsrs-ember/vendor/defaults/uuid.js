var BSRS_UUID_DEFAULTS_OBJECT = (function() {
    var factory = function() {
    };
    factory.prototype.defaults = function() {
        return {
            value: 'abc123', //update to a true guid after pre/re factor
        };
    };
    return factory;
})();

if (typeof window === 'undefined') {
    module.exports = new BSRS_UUID_DEFAULTS_OBJECT().defaults();
} else {
    define('bsrs-ember/vendor/defaults/uuid', ['exports'], function (exports) {
        'use strict';
        return new BSRS_UUID_DEFAULTS_OBJECT().defaults();
    });
}
