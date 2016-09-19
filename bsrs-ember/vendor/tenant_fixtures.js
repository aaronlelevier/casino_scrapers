var BSRS_TENANT_FACTORY = (function() {
  var factory = function(tenant, currency, country, config) {
    this.tenant = tenant;
    this.currency = currency;
    this.country = country;
    this.config = config;
  };
  factory.prototype.generate = function(i) {
    var id = i || this.tenant.idOne;
    return {
      id: id,
      company_name: this.tenant.companyNameOne,
      currency: {
        id: this.tenant.currencyOne,
        name: this.tenant.name
      },
      country: [{
        id: this.country.id,
        name: this.country.name
      }]
    };
  };
  factory.prototype.generate_put = function(i) {
    var id = i || this.tenant.idOne;
    return {
      id: id,
      company_name: this.tenant.companyNameOne,
      currency: this.tenant.currencyOne,
      country: [this.country.id]
    };
  };
  factory.prototype.detail = function(id) {
    return this.generate(id);
  };
  factory.prototype.put = function(tenant) {
    var id = tenant && tenant.id || this.tenant.idOne;
    var response = this.generate_put(id);
    response.currency = response.currency.id;
    for(var key in tenant) {
      response[key] = tenant[key];
    }
    return response;
  };
  factory.prototype.list = function() {
    var page_size = this.config.default ? this.config.default.APP.PAGE_SIZE : 10;
    return this._list(0, page_size);
  };
  factory.prototype.list_two = function() {
    var page_size = this.config.default ? this.config.default.APP.PAGE_SIZE : 10;
    return this._list(page_size+1, page_size*2);
  };
  factory.prototype.list_reverse = function() {
    var page_size = this.config.default ? this.config.default.APP.PAGE_SIZE : 10;
    var results = [];
    for(var i = page_size; i > 0; i--) {
      results.push(this._generate_item(i));
    }
    return {count: page_size*2-1, next: null, previous: null, results: results};
  };
  factory.prototype._list = function(start, end) {
    var page_size = this.config.default ? this.config.default.APP.PAGE_SIZE : 10;
    var results = [];
    for(var i = start; i < end; i++) {
      results.push(this._generate_item(i));
    }
    return {count: page_size*2-1, next: null, previous: null, results: results};
  };
  factory.prototype._generate_item = function(i) {
    return {
      id: `${this.tenant.idOne.slice(0,-1)}${i}`,
      company_name: `${this.tenant.companyNameOne}${i}`,
      currency: {
        id: `${this.tenant.currencyOne.slice(0,-1)}${i}`,
        name: `${this.tenant.name}${i}`,
      },
      country: [{
        id: `${this.country.id.slice(0,-1)}${i}`,
        name: `${this.country.name}${i}`,
      }]
    };
  };
  return factory;
})();

if (typeof window === 'undefined') {
  var objectAssign = require('object-assign');
  var mixin = require('../vendor/mixin');
  var tenant = require('./defaults/tenant');
  var currency = require('./defaults/currency');
  var country = require('./defaults/country');
  var config = require('../config/environment');
  objectAssign(BSRS_TENANT_FACTORY.prototype, mixin.prototype);
  module.exports = new BSRS_TENANT_FACTORY(tenant, currency, country, config);
}
else {
  define('bsrs-ember/vendor/tenant_fixtures',
    ['exports', 'bsrs-ember/vendor/defaults/tenant', 'bsrs-ember/vendor/defaults/currency', 'bsrs-ember/vendor/defaults/country', 'bsrs-ember/vendor/mixin', 'bsrs-ember/config/environment'],
    function(exports, tenant, currency, country, mixin, config) {
      'use strict';
      Object.assign(BSRS_TENANT_FACTORY.prototype, mixin.prototype);
      return new BSRS_TENANT_FACTORY(tenant, currency, country, config);
    }
  );
}
