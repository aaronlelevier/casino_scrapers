var BSRS_TICKET_CATEGORY_DEFAULTS_OBJECT = (function() {
    var factory = function() {
    };
    factory.prototype.defaults = function() {
        return {
            idOne: 'c44695d0-a82d-451f-a9c3-d87aaa47ac45',
            idTwo: 'cae202c7-7f38-4e42-8e18-09ecc06ed047',
            idThree: 'cdd6eeea-c2f8-4f66-8fbf-af28d28c801b',
        };
    };
    return factory;
})();

if (typeof window === 'undefined') {
    module.exports = new BSRS_TICKET_CATEGORY_DEFAULTS_OBJECT().defaults();
} else {
    define('bsrs-ember/vendor/defaults/model-category', ['exports'], function (exports) {
        'use strict';
        return new BSRS_TICKET_CATEGORY_DEFAULTS_OBJECT().defaults();
    });
}

