var BSRS_ADDRESS_FACTORY = (function() {
    var factory = function(address_type_defaults, country_list, state_list) {
        this.address_type_defaults = address_type_defaults;
        this.country_list = country_list;
        this.state_list = state_list;
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
                'state': this.state_list.firstId,
                'postal_code': '92123',
                'country': this.country_list.firstId
            },
            {
                'id': 2,
                'type': {
                    'id': this.address_type_defaults.shippingType,
                    'name':this.address_type_defaults.shippingName
                },
                'address': '123 PB',
                'city': 'San Diego',
                'state': this.state_list.firstId,
                'postal_code': '92100',
                'country': this.country_list.firstId
            }
        ];
    };
    factory.prototype.put = function(address) {
        var addresses = [
            {id: 1, type: this.address_type_defaults.officeType, address: 'Sky Park', city: 'San Diego', state: this.state_list.firstId, postal_code: '92123', country: this.country_list.firstId},
            {id: 2, type: this.address_type_defaults.shippingType, address: '123 PB', city: 'San Diego', state: this.state_list.firstId, postal_code: '92100', country: this.country_list.firstId}
        ];
        if (!address) {
            return addresses;
        }
        addresses.forEach(function(model) {
            if (model.id === address.id) {
                for (var attr in address) {
                    model[attr] = address[attr];
                }
            }
        });
        return addresses;
    };
    return factory;
})();

if (typeof window === 'undefined') {
    var country_list = require('./country');
    var state_list = require('./state');
    var address_type_defaults = require('./address-type');
    module.exports = new BSRS_ADDRESS_FACTORY(address_type_defaults, country_list, state_list);
} else {
    define('bsrs-ember/vendor/address_fixtures', ['exports', 'bsrs-ember/vendor/address-type', 'bsrs-ember/vendor/country', 'bsrs-ember/vendor/state'], function (exports, address_type_defaults, country_list, state_list) {
        'use strict';
        return new BSRS_ADDRESS_FACTORY(address_type_defaults, country_list, state_list);
    });
}
