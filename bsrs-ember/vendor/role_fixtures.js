var BSRS_ROLE_FACTORY = (function() {
  var factory = function(role_defaults, currency_defaults, category_fixtures, location_level_fixtures, config) {
    this.role_defaults = role_defaults;
    this.currency_defaults = currency_defaults;
    this.category_fixtures = category_fixtures.default || category_fixtures;
    this.location_level_fixtures = location_level_fixtures.default || location_level_fixtures;
    this.config = config;
  };
  factory.prototype.generate = function(i, name, inherited) {
    var id = i || this.role_defaults.idOne;
    return {
      id: id,
      name: name || this.role_defaults.nameOne,
      role_type: this.role_defaults.t_roleTypeGeneral,
      location_level: this.location_level_fixtures.detail().id,
      categories: [this.category_fixtures.generate_for_power_select()],
      auth_amount: this.currency_defaults.authAmountOne,
      inherited: inherited || this.role_defaults.inherited,
      permissions: this.role_defaults.permissions
    }
  };
  factory.prototype.generate_list = function(i) {
    var id = i || this.role_defaults.idOne;
    return {
      id: id,
      name: this.role_defaults.nameOne,
      role_type: this.role_defaults.t_roleTypeGeneral,
      location_level: this.location_level_fixtures.detail().id,
    }
  };
  factory.prototype.list = function() {
    var response = [];
    var uuid = 'af34ee9b-833c-4f3e-a584-b6851d1e04b';
    response.push({id: uuid + 1, name: this.role_defaults.nameOne, location_level: this.location_level_fixtures.detail().id, role_type: this.role_defaults.t_roleTypeGeneral });
    response.push({id: uuid + 2, name: this.role_defaults.nameTwo, location_level: this.location_level_fixtures.detail().id, role_type: this.role_defaults.t_roleTypeGeneral });
    response.push({id: uuid + 3, name: this.role_defaults.nameThree, location_level: this.location_level_fixtures.detail().id, role_type: this.role_defaults.t_roleTypeGeneral });
    var page_size = this.config.default ? this.config.default.APP.PAGE_SIZE : 10;
    for (var i=4; i <= page_size; i++) {
      var rando_uuid = 'af34ee9b-833c-4f3e-a584-b6851d1e04';
      if (i < page_size) {
        rando_uuid = rando_uuid + '0' + i;
      } else{
        rando_uuid = rando_uuid + i;
      }
      var role = this.generate_list(rando_uuid);
      role.name = 'zap' + i;
      response.push(role);
    }
    return {'count':page_size*2-1,'next':null,'previous':null,'results': response};
  };
  factory.prototype.list_two = function() {
    var response = [];
    var page_size = this.config.default ? this.config.default.APP.PAGE_SIZE : 10;
    for (var i=page_size+1; i <= page_size*2-1; i++) {
      var uuid = 'af34ee9b-833c-4f3e-a584-b6851d1e04';
      var role = this.generate_list(uuid + i);
      role.name = 'xav' + i;
      role.role_type = this.role_defaults.t_roleTypeContractor;
      response.push(role);
    }
    return {'count':page_size*2-1,'next':null,'previous':null,'results': response};
  };
  factory.prototype.detail = function(i, name, settings) {
    var role = this.generate(i, name, settings);
    return role;
  };
  factory.prototype.put = function(role) {
    var response = this.generate(role.id);
    response.location_level = this.location_level_fixtures.detail().id;
    response.categories = [response.categories[0].id];
    response.dashboard_text = response.inherited.dashboard_text.value;
    response.auth_currency = response.inherited.auth_currency.value;
    // response.auth_amount = response.inherited.auth_amount.value;
    delete response.inherited;
    for (var key in role) {
      response[key] = role[key];
    }
    return response;
  };
  return factory;
}());

if (typeof window === 'undefined') {
  var objectAssign = require('object-assign');
  var mixin = require('../vendor/mixin');
  var role_defaults = require('../vendor/defaults/role');
  var currency_defaults = require('../vendor/defaults/currency');
  var category_fixtures = require('../vendor/category_fixtures');
  var location_level_fixtures = require('../vendor/location-level_fixtures');
  var config = require('../config/environment');
  objectAssign(BSRS_ROLE_FACTORY.prototype, mixin.prototype);
  module.exports = new BSRS_ROLE_FACTORY(role_defaults, currency_defaults, category_fixtures, location_level_fixtures, config);
}
else {
  define('bsrs-ember/vendor/role_fixtures', ['exports', 'bsrs-ember/vendor/defaults/role', 'bsrs-ember/vendor/defaults/currency', 'bsrs-ember/vendor/category_fixtures', 'bsrs-ember/vendor/location-level_fixtures', 'bsrs-ember/vendor/mixin', 'bsrs-ember/config/environment'],
    function(exports, role_defaults, currency_defaults, category_fixtures, location_level_fixtures, mixin, config) {
      'use strict';
      Object.assign(BSRS_ROLE_FACTORY.prototype, mixin.prototype);
      var Factory = new BSRS_ROLE_FACTORY(role_defaults, currency_defaults, category_fixtures, location_level_fixtures, config);
      return {
        default: Factory
      };
    });
}
