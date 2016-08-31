var BSRS_ADDRESS_FACTORY = (function() {
  var factory = function(address, addressType, country, state, people) {
    this.address = address;
    this.addressType = addressType;
    this.country = country;
    this.state = state;
    this.person = people;
  };
  factory.prototype.get = function() {
    return [{
      id: this.address.idOne,
      address: this.address.streetOne,
      city: this.address.cityOne,
      postal_code: this.address.zipOne,
      country: {
        id: this.country.id,
        name: this.country.name
      },
      state: {
        id: this.state.id,
        name: this.state.name
      },
      type: {
        id: this.addressType.idOne,
        name: this.addressType.officeName
      }
    }, {
      id: this.address.idTwo,
      address: this.address.streetTwo,
      city: this.address.cityTwo,
      postal_code: this.address.zipTwo,
      country: {
        id: this.country.idTwo,
        name: this.country.nameTwo
      },
      state: {
        id: this.state.idTwo,
        name: this.state.nameTwo
      },
      type: {
        id: this.addressType.idTwo,
        name: this.addressType.shippingName
      }
    }];
  };
  factory.prototype.get_with_related_ids = function() {
    return [{
      id: this.address.idOne,
      address: this.address.streetOne,
      city: this.address.cityOne,
      postal_code: this.address.zipOne,
      country: this.country.id,
      state: this.state.id,
      type: this.addressType.idOne,
    }, {
      id: this.address.idTwo,
      address: this.address.streetTwo,
      city: this.address.cityTwo,
      postal_code: this.address.zipTwo,
      country: this.country.idTwo,
      state: this.state.idTwo,
      type: this.addressType.idTwo,
    }];
  };
  factory.prototype.put = function(address) {
    var addresses = this.get();
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
  var country = require('./defaults/country');
  var state = require('./defaults/state');
  var addressType = require('./defaults/address-type');
  var address = require('./defaults/address');
  var people = require('./defaults/person');
  module.exports = new BSRS_ADDRESS_FACTORY(address, addressType, country, state, people);
}
else {
  define('bsrs-ember/vendor/address_fixtures', ['exports', 'bsrs-ember/vendor/defaults/address', 'bsrs-ember/vendor/defaults/address-type', 'bsrs-ember/vendor/defaults/country', 'bsrs-ember/vendor/defaults/state', 'bsrs-ember/vendor/defaults/person'], function(exports, address, addressType, country, state, people) {
    'use strict';
    return new BSRS_ADDRESS_FACTORY(address, addressType, country, state, people);
  });
}