const OFFICE_ADDRESS_TYPE = '8e16a68c-fda6-4c30-ba7d-fee98257e92d';
const SHIPPING_ADDRESS_TYPE = 'f7e55e71-1ff2-4cc2-8700-139802738bd0';
const OFFICE_ADDRESS_NAME = 'admin.address_type.office';
const SHIPPING_ADDRESS_NAME = 'admin.address_type.shipping';

var address_type_defaults = {officeType: OFFICE_ADDRESS_TYPE, officeName: OFFICE_ADDRESS_NAME, shippingType: SHIPPING_ADDRESS_TYPE, shippingName: SHIPPING_ADDRESS_NAME };

if (typeof window === 'undefined') {
    module.exports = address_type_defaults;
} else {
    define('bsrs-ember/vendor/defaults/address-type', ['exports'], function (exports) {
        'use strict';
        return address_type_defaults;
    });
}
