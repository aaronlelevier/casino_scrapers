const OFFICE_ADDRESS_TYPE = 1;
const SHIPPING_ADDRESS_TYPE = 2;
const OFFICE_ADDRESS_NAME = 'admin.address_type.office';
const SHIPPING_ADDRESS_NAME = 'admin.address_type.shipping';

var address_type_defaults = {officeType: OFFICE_ADDRESS_TYPE, officeName: OFFICE_ADDRESS_NAME, shippingType: SHIPPING_ADDRESS_TYPE, shippingName: SHIPPING_ADDRESS_NAME };

if (typeof window === 'undefined') {
    module.exports = address_type_defaults;
} else {
    define('bsrs-ember/vendor/address-type', ['exports'], function (exports) {
        'use strict';
        return address_type_defaults;
    });
}
