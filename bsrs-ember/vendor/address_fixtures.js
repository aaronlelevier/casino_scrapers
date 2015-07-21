var BSRS_ADDRESS_FACTORY = (function() {
    var factory = function() {
    };
    factory.prototype.get = function() {
        return [
            {
                'id': 1,
                'type': {
                    'id': 1,
                    'name': 'admin.address_type.office'
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
                    'id': 2,
                    'name': 'admin.address_type.shipping'
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
    module.exports = new BSRS_ADDRESS_FACTORY();
} else {
    define('bsrs-ember/vendor/address_fixtures', ['exports'], function (exports) {
        'use strict';
        return new BSRS_ADDRESS_FACTORY();
    });
}
