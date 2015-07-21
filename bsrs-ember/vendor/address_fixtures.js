var BSRS_ADDRESS_FACTORY = (function() {
    var factory = function(address_type_defaults) {
        this.address_type_defaults = address_type_defaults;
    };
    factory.prototype.get = function() {
        return [
            {
                'id': 1,
                'type': {
                    'id': this.address_type_defaults.officeType,
                    'name':this.address_type_defaults.officeName
                },
                'address': 'Sky Park',
                'city': 'San Diego',
                'state': 5,
                'postal_code': '92123',
                'country': 1
            },
            {
                'id': 2,
                'type': {
                    'id': this.address_type_defaults.shippingType,
                    'name':this.address_type_defaults.shippingName
                },
                'address': '123 PB',
                'city': 'San Diego',
                'state': 5,
                'postal_code': '92100',
                'country': 1
            }
        ];
    };
    factory.prototype.put = function(i) {
        return [
            {id: 1, type: 1, address: 'Sky Park', city: 'San Diego', state: 5, postal_code: '92123', country: 1},
            {id: 2, type: 2, address: '123 PB', city: 'San Diego', state: 5, postal_code: '92100', country: 1}
        ];
    };
    return factory;
})();

if (typeof window === 'undefined') {
    var address_type_defaults = require('../app/value-defaults/address-type');
    module.exports = new BSRS_ADDRESS_FACTORY(address_type_defaults['default']);
} else {
    define('bsrs-ember/vendor/address_fixtures', ['exports', 'bsrs-ember/value-defaults/address-type'], function (exports, address_type_defaults) {
        'use strict';
        return new BSRS_ADDRESS_FACTORY(address_type_defaults['default']);
    });
}
