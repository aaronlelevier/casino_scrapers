var BSRS_ADDRESS_TYPE_DEFAULTS_OBJECT = (function() {
    var factory = function() {
    };
    factory.prototype.defaults = function() {
        return {
            idOne: '8e16a68c-fda6-4c30-ba7d-fee98257e921',
            idTwo: '8e16a68c-fda6-4c30-ba7d-fee98257e922',
            officeId: '8e16a68c-fda6-4c30-ba7d-fee98257e92d',
            shippingId: 'f7e55e71-1ff2-4cc2-8700-139802738bd0',
            officeName: 'admin.address_type.office',
            officeNameText: 'Office',
            shippingName: 'admin.address_type.shipping',
            shippingNameText: 'Shipping',
        };
    };
    return factory;
})();

if (typeof window === 'undefined') {
    module.exports = new BSRS_ADDRESS_TYPE_DEFAULTS_OBJECT().defaults();
} else {
    define('bsrs-ember/vendor/defaults/address-type', ['exports'], function (exports) {
        'use strict';
        return new BSRS_ADDRESS_TYPE_DEFAULTS_OBJECT().defaults();
    });
}
