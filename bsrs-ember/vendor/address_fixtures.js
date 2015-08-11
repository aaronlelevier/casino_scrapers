var BSRS_ADDRESS_FACTORY = (function() {
    var factory = function(address_defaults, address_type_defaults, country_list, state_list, people_defaults) {
        this.address_defaults = address_defaults;
        this.address_type_defaults = address_type_defaults;
        this.country_list = country_list;
        this.state_list = state_list;
        this.person = people_defaults;
    };
    factory.prototype.get = function() {
        return [
            {
                'id': this.address_defaults.idOne,
                'type': {
                    'id': this.address_type_defaults.officeId,
                    'name':this.address_type_defaults.officeName
                },
                'address': 'Sky Park',
                'city': 'San Diego',
                'state': this.state_list.id,
                'postal_code': '92123',
                'country': this.country_list.id,
                'person': this.person.id
            },
            {
                'id': this.address_defaults.idTwo,
                'type': {
                    'id': this.address_type_defaults.shippingId,
                    'name':this.address_type_defaults.shippingName
                },
                'address': '123 PB',
                'city': 'San Diego',
                'state': this.state_list.id,
                'postal_code': '92100',
                'country': this.country_list.idTwo,
                'person': this.person.id
            }
        ];
    };
    factory.prototype.put = function(address) {
        var addresses = [
            {id: this.address_defaults.idOne, type: this.address_type_defaults.officeId, address: 'Sky Park', city: 'San Diego', state: this.state_list.id, postal_code: '92123', country: this.country_list.id, person: this.person.id},
            {id: this.address_defaults.idTwo, type: this.address_type_defaults.shippingId, address: '123 PB', city: 'San Diego', state: this.state_list.id, postal_code: '92100', country: this.country_list.idTwo, person: this.person.id}
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
    var country_list = require('./defaults/country');
    var state_list = require('./defaults/state');
    var address_type_defaults = require('./defaults/address-type');
    var address_defaults = require('./defaults/address');
    var people_defaults = require('./defaults/person');
    module.exports = new BSRS_ADDRESS_FACTORY(address_defaults, address_type_defaults, country_list, state_list, people_defaults);
} else {
    define('bsrs-ember/vendor/address_fixtures', ['exports', 'bsrs-ember/vendor/defaults/address', 'bsrs-ember/vendor/defaults/address-type', 'bsrs-ember/vendor/defaults/country', 'bsrs-ember/vendor/defaults/state', 'bsrs-ember/vendor/defaults/person'], function (exports, address_defaults, address_type_defaults, country_list, state_list, people_defaults) {
        'use strict';
        return new BSRS_ADDRESS_FACTORY(address_defaults, address_type_defaults, country_list, state_list, people_defaults);
    });
}
