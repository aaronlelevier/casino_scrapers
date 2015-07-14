//import AddressType from 'bsrs-ember/models/address-type';

var ADDRESS_TYPES = [
    // AddressType.create({
    //   id: 1,
    //   name: 'admin.address_type.office'
    // }),
    // AddressType.create({
    //   id: 2,
    //   name: 'admin.address_type.shipping'
    // })
];

if (typeof window === 'undefined') {
    module.exports = ADDRESS_TYPES;
} else {
    define('bsrs-ember/vendor/address_types_fixtures', ['exports'], function (exports) {
        'use strict';
        return ADDRESS_TYPES;
    });
}
