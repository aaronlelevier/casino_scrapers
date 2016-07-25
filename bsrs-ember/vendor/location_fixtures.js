var BSRS_LOCATION_FACTORY = (function() {
  var factory = function(location_defaults, location_status_defaults, location_level_defaults, location_level_fixtures, email_fixtures, phone_number_fixtures, address_fixtures, config) {
    this.location_defaults = location_defaults;
    this.location_level_defaults = location_level_defaults;
    this.location_status_defaults = location_status_defaults;
    this.location_level_fixtures = location_level_fixtures.default || location_level_fixtures;
    this.emails = email_fixtures;
    this.phone_numbers = phone_number_fixtures;
    this.addresses = address_fixtures;
    this.config = config;
  };
  factory.prototype.get = function(i, name) {
    var name = name || this.location_defaults.storeName;
    return {
      id: i || this.location_defaults.idOne,
      name: name,
      number: this.location_defaults.storeNumber,
      location_level: this.location_level_fixtures.detail().id,
      status: this.location_status_defaults.openId
    }
  };
  factory.prototype.get_fk = function(i, name) {
    var name = name || this.location_defaults.storeName;
    return {
      id: i || this.location_defaults.idOne,
      name: name,
      number: this.location_defaults.storeName,
      location_level: this.location_level_fixtures.detail().id,
      status_fk: this.location_status_defaults.openId,
    };
  };
  factory.prototype.get_no_related = function(i, name) {
    /* ticket list location */
    return {
      id: i || this.location_defaults.idOne,
      name: name || this.location_defaults.baseStoreName,
      number: this.location_defaults.storeNumber,
      location_level_fk: this.location_defaults.location_level.id,
    }
  };
  factory.prototype.generate_list = function(i) {
    return {
      id: i,
      name: this.location_defaults.baseStoreName,
      number : this.location_defaults.storeNumber,
      status: {id: this.location_status_defaults.openId, name: this.location_status_defaults.openName},
      location_level: this.location_level_fixtures.detail().id,
    }
  };
  factory.prototype.generate = function(i) {
    var id = i || this.location_defaults.idOne;
    return {
      id: id,
      name : this.location_defaults.baseStoreName,
      number : this.location_defaults.storeNumber,
      status_fk: this.location_defaults.status,
      location_level: this.location_level_fixtures.detail().id,
      children: [this.get(this.location_defaults.idTwo, this.location_defaults.storeNameTwo), this.get(this.location_defaults.idThree, this.location_defaults.storeNameThree)],
      parents: [this.get(this.location_defaults.idParent, this.location_defaults.storeNameParent),this.get(this.location_defaults.idParentTwo, this.location_defaults.storeNameParentTwo) ],
    }
  };
  factory.prototype.list = function() {
    var response = [];
    var page_size = this.config.default ? this.config.default.APP.PAGE_SIZE : 10;
    for (var i=1; i <= page_size; i++) {
      var uuid = '232z46cf-9fbb-456z-4hc3-59728vu3099';
      if (i < page_size) {
        uuid = uuid + '0' + i;
      } else {
        uuid = uuid + i;
      }
      var location = this.generate_list(uuid);
      delete location.children;//to be consistent with API
      delete location.parents;
      if (i === 0) {
        location.name = location_defaults.storeName;
      } else {
        location.name = location.name + i;
      }
      location.number = location.number + i;
      location.status = {id: this.location_status_defaults.openId, name: this.location_status_defaults.openName};
      response.push(location);
    }
    //we do a reverse order sort here to verify a real sort occurs in the component
    var sorted = response.sort(function(a,b) {
      return b.id - a.id;
    });
    return {'count':page_size*2-1,'next':null,'previous':null,'results': sorted};
  };
  factory.prototype.list_two = function() {
    var response = [];
    var page_size = this.config.default ? this.config.default.APP.PAGE_SIZE : 10;
    for (var i=page_size+1; i <= page_size*2-1; i++) {
      var uuid = '232z46cf-9fbb-456z-4hc3-59728vu3099';
      var location = this.generate_list(uuid + i);
      delete location.children;
      delete location.parents;
      location.name = 'vzoname' + i;
      location.number = 'sconumber' + i;
      location.status = {id: this.location_status_defaults.closedId, name: this.location_status_defaults.closedName};
      location.location_level = this.location_level_defaults.idTwo;
      response.push(location);
    }
    return {'count':page_size*2-1,'next':null,'previous':null,'results': response};
  };
  factory.prototype.detail = function(i) {
    var model = this.generate(this.location_defaults.idOne);
    model.emails = this.emails.get();
    model.phone_numbers = this.phone_numbers.get();
    model.addresses = this.addresses.get();
    return model;
  };
  factory.prototype.put = function(location) {
    var response = this.generate(location.id);
    response.status = response.status_fk;
    delete response.status_fk;
    response.location_level = this.location_level_fixtures.detail().id;
    response.emails = this.emails.get();
    response.phone_numbers = this.phone_numbers.get();
    response.addresses = this.addresses.get();
    response.children = response.children.map(function(map) {
      return map.id;
    });
    response.parents = response.parents.map(function(map) {
      return map.id;
    });
    for(var key in location) {
      response[key] = location[key];
    }
    return response;
  };
  //TODO: Check to see if this is still used
  factory.prototype.search = function() {
    var location_one = this.get_fk(this.location_defaults.idFour, this.location_defaults.storeNameFour);
    var location_two = this.get_fk(this.location_defaults.idTwo, this.location_defaults.storeNameTwo);
    var response = [location_one, location_two];
    //we do a reverse order sort here to verify a real sort occurs in the component
    var sorted = response.sort(function(a,b) {
      return b.id - a.id;
    });
    return {'count':2,'next':null,'previous':null,'results': sorted};
  };
  factory.prototype.search_idThree = function() {
    var location_one = this.get_no_related(this.location_defaults.idThree, this.location_defaults.storeNameThree);
    return [location_one];
  };
  factory.prototype.search_power_select = function() {
    var location_one = this.get_no_related(this.location_defaults.idFour, this.location_defaults.storeNameFour);
    var location_two = this.get_no_related(this.location_defaults.idTwo, this.location_defaults.storeNameTwo);
    var response = [location_one, location_two];
    return response;
  };
  factory.prototype.list_power_select = function() {
    var response = [];
    var page_size = this.config.default ? this.config.default.APP.PAGE_SIZE : 10;
    for (var i=1; i <= page_size; i++) {
      var uuid = '232z46cf-9fbb-456z-4hc3-59728vu3099';
      if (i < page_size) {
        uuid = uuid + '0' + i;
      } else {
        uuid = uuid + i;
      }
      var location = this.get_no_related(uuid);
      if (i === 0) {
        location.name = location_defaults.storeName;
      } else {
        location.name = location.name + i;
      }
      location.number = location.number + i;
      response.push(location);
    }
    return response;
  };

  return factory;
})();

if (typeof window === 'undefined') {
  var objectAssign = require('object-assign');
  var mixin = require('../vendor/mixin');
  var location_defaults = require('../vendor/defaults/location');
  var location_status_defaults = require('../vendor/defaults/location-status');
  var location_level_fixtures = require('../vendor/location-level_fixtures');
  var location_level_defaults = require('../vendor/defaults/location-level');
  var address_fixtures = require('../vendor/address_fixtures');
  var email_fixtures = require('../vendor/email_fixtures');
  var phone_number_fixtures = require('../vendor/phone_number_fixtures');
  var config = require('../config/environment');
  objectAssign(BSRS_LOCATION_FACTORY.prototype, mixin.prototype);
  module.exports = new BSRS_LOCATION_FACTORY(location_defaults, location_status_defaults, location_level_defaults, location_level_fixtures, email_fixtures, phone_number_fixtures, address_fixtures, config);
} else {
  define('bsrs-ember/vendor/location_fixtures', ['exports', 'bsrs-ember/vendor/defaults/location', 'bsrs-ember/vendor/defaults/location-status', 'bsrs-ember/vendor/defaults/location-level', 'bsrs-ember/vendor/location-level_fixtures', 'bsrs-ember/vendor/email_fixtures', 'bsrs-ember/vendor/phone_number_fixtures', 'bsrs-ember/vendor/address_fixtures', 'bsrs-ember/vendor/mixin', 'bsrs-ember/config/environment'], function (exports, location_defaults, location_status_defaults, location_level_defaults, location_level_fixtures, email_fixtures, phone_number_fixtures, address_fixtures, mixin, config) {
    'use strict';
    Object.assign(BSRS_LOCATION_FACTORY.prototype, mixin.prototype);
    var Factory = new BSRS_LOCATION_FACTORY(location_defaults, location_status_defaults, location_level_defaults, location_level_fixtures, email_fixtures, phone_number_fixtures, address_fixtures, config);
    return {default: Factory};
  });
}
