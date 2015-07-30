var BSRS_CATEGORY_DEFAULTS_OBJECT = (function() {
    var factory = function() {
    };
    factory.prototype.defaults = function() {
        return {
            id: '932t43cf-8fba-446a-4ec3-19778ce79990',
            idTwo: '132543cf-bfba-426a-3fc9-17778cd79990',
            name: 'Repair',
            nameTwo: 'Maintenance',
            nameThree: 'Loss Prevention', 
            status: 'Active'
        };
    };
    return factory;
})();

if (typeof window === 'undefined') {
    module.exports = new BSRS_CATEGORY_DEFAULTS_OBJECT().defaults();
} else {
    define('bsrs-ember/vendor/defaults/category', ['exports'], function (exports) {
        'use strict';
        return new BSRS_CATEGORY_DEFAULTS_OBJECT().defaults();
    });
}
