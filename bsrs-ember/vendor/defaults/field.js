var BSRS_FIELDS_DEFAULTS_OBJECT = (function() {
    var factory = function() {
    };
    factory.prototype.defaults = function() {
        return {
            idOne: 'a12695d0-a82d-451f-a9c3-d87aaa47ac44',
            idTwo: 'a12695d0-a82d-451f-a9c3-d87aaa47ac45',
            idThree: 'a12695d0-a82d-451f-a9c3-d87aaa47ac46',
            labelOne: 'name',
            labelTwo: 'age',
            labelThree: 'address',
            typeOne: 'admin.dtd.label.field.text',
            typeTwo: 'admin.dtd.label.field.number',
            typeThree: 'admin.dtd.label.field.textarea',
            typeFour: 'admin.dtd.label.field.select',
            typeFive: 'admin.dtd.label.field.with_options',
            typeSix: 'admin.dtd.label.field.checkbox',
            typeSeven: 'admin.dtd.label.field.file',
            typeEight: 'admin.dtd.label.field.asset_select',
            typeNine: 'admin.dtd.label.field.check_in',
            typeTen: 'admin.dtd.label.field.check_out',
            requiredOne: false,
            requiredTwo: true
        };
    };
    return factory;
})();

if (typeof window === 'undefined') {
    module.exports = new BSRS_FIELDS_DEFAULTS_OBJECT().defaults();
} else {
    define('bsrs-ember/vendor/defaults/field',
        ['exports'],
        function (exports) {
        'use strict';
        return new BSRS_FIELDS_DEFAULTS_OBJECT().defaults();
    });
}

