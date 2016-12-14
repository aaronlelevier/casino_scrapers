var BSRS_ADDRESS_FACTORY = (function() {
  var factory = function(address, addressType, country, state, people) {
    this.address = address;
    this.addressType = addressType;
    this.country = country;
    this.state = state;
    this.person = people['default'].defaults();
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
      type: this.addressType.officeId,
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
      type: this.addressType.shippingId,
    }];
  };
  factory.prototype.get_belongs_to = function() {
    /* used for eg. in the tenant get */
    return {
      id: this.address.idOne,
      type: this.addressType.officeId,
      address: this.address.streetOne,
      city: this.address.cityOne,
      state: {
        id: this.state.id,
        name: this.state.name
      },
      postal_code: this.address.zipOne,
      country: {
        id: this.country.id,
        name: this.country.name
      },
    }
  };
  factory.prototype.get_with_related_ids = function() {
    return [{
      id: this.address.idOne,
      type: this.addressType.officeId,
      address: this.address.streetOne,
      city: this.address.cityOne,
      state: this.state.id,
      postal_code: this.address.zipOne,
      country: this.country.id,
    }, {
      id: this.address.idTwo,
      type: this.addressType.shippingId,
      address: this.address.streetTwo,
      city: this.address.cityTwo,
      state: this.state.idTwo,
      postal_code: this.address.zipTwo,
      country: this.country.idTwo,
    }];
  };
  factory.prototype.put = function(address) {
    var addresses = this.get_with_related_ids();
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
  factory.prototype.put_belongs_to = function() {
    /* used for eg. in the tenant get */
    return {
      id: this.address.idOne,
      type: this.addressType.officeId,
      address: this.address.streetOne,
      city: this.address.cityOne,
      state: this.state.id,
      postal_code: this.address.zipOne,
      country: this.country.id,
    }
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
