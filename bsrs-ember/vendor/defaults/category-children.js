var BSRS_CATEGORY_CHILD_DEFAULTS_OBJECT = (function() {
    var factory = function() {
    };
    factory.prototype.defaults = function() {
        return {
            idOne: 'z44695d0-a82d-451f-a9c3-d87aaa57ac55',
            idTwo: 'jae202c7-7f38-4e42-8e18-09ecc86ed046',
            idThree: 'zdd6eees-c2f8-4f66-8fbf-af28d28c802p',
        };
    };
    return factory;
})();

if (typeof window === 'undefined') {
    module.exports = new BSRS_CATEGORY_CHILD_DEFAULTS_OBJECT().defaults();
} else {
    define('bsrs-ember/vendor/defaults/category-children', ['exports'], function (exports) {
        'use strict';
        return new BSRS_CATEGORY_CHILD_DEFAULTS_OBJECT().defaults();
    });
}

