var BSRS_ROLE_CATEGORY_DEFAULTS_OBJECT = (function() {
    var factory = function() {
    };
    factory.prototype.defaults = function() {
        return {
            idOne: 'c53e988b-a27b-4302-923b-0182a462f5c4',
            idTwo: '375d4fe8-4f81-472f-885e-b702a7e495da',
            abc: 'abc123'
        };
    };
    return factory;
})();

if (typeof window === 'undefined') {
    module.exports = new BSRS_ROLE_CATEGORY_DEFAULTS_OBJECT().defaults();
} else {
    define('bsrs-ember/vendor/defaults/role-category', ['exports'], function (exports) {
        'use strict';
        return new BSRS_ROLE_CATEGORY_DEFAULTS_OBJECT().defaults();
    });
}
