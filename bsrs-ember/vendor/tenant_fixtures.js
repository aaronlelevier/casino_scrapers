var BSRS_TENANT_FACTORY = (function() {
  var factory = function(tenant, currency, country, person, phonenumber, email, email_defaults, address, config) {
    this.tenant = tenant;
    this.currency = currency;
    this.country = country;
    this.person = person;
    this.phonenumber = phonenumber;
    this.email = email;
    this.email_defaults = email_defaults;
    this.address = address;
    this.config = config;
  };
  factory.prototype.detail = function(id) {
    return this.generate(id);
  };
  factory.prototype.generate = function(i) {
    var id = i || this.tenant.idOne;
    return {
      id: id,
      scid: this.tenant.scidOne,
      company_name: this.tenant.companyNameOne,
      company_code: this.tenant.companyCodeOne,
      dashboard_text: this.tenant.dashboardTextOne,
      implementation_contact_initial: this.tenant.implementationContactInitialOne,
      billing_contact: this.tenant.billingContactOne,
      test_mode: false,
      default_currency: {
        id: this.tenant.currencyOne,
        name: this.tenant.name
      },
      billing_phone_number: this.phonenumber.get_belongs_to(),
      billing_email: this.email.get_belongs_to(this.email_defaults.idOne),
      billing_address: this.address.get_belongs_to(),
      implementation_email: this.email.get_belongs_to(this.email_defaults.idTwo),
      implementation_contact: {
        id: this.person.id,
        fullname: this.person.fullname
      },
      countries: [{
        id: this.country.id,
        name: this.country.name
      }]
    };
  };
  factory.prototype.put = function(tenant) {
    var id = tenant && tenant.id || this.tenant.idOne;
    var response = this.generate_put(id);
    for(var key in tenant) {
      response[key] = tenant[key];
    }
    return response;
  };
  factory.prototype.generate_put = function(i) {
    var id = i || this.tenant.idOne;
    return {
      id: id,
      company_name: this.tenant.companyNameOne,
      company_code: this.tenant.companyCodeOne,
      dashboard_text: this.tenant.companyDashboardTextOne,
      default_currency: this.tenant.currencyOne,
      countries: [this.country.id],
      implementation_contact_initial: this.tenant.implementationContactInitialOne,
      billing_contact: this.tenant.billingContactOne,
      implementation_contact: this.person.id,
      test_mode: this.tenant.testModeFalse,
      billing_phone_number: this.phonenumber.get_belongs_to(),
      billing_email: this.email.get_belongs_to(this.email_defaults.idOne),
      implementation_email: this.email.get_belongs_to(this.email_defaults.idTwo),
      billing_address: this.address.put_belongs_to(),
    };
  };
  factory.prototype.post = function(tenant) {
    var id = tenant && tenant.id || this.tenant.idOne;
    var response = this.generate_post(id);
    for(var key in tenant) {
      response[key] = tenant[key];
    }
    return response;
  };
  factory.prototype.generate_post = function(i) {
    var id = i || this.tenant.idOne;
    return {
      id: id,
      company_name: this.tenant.companyNameOne,
      company_code: this.tenant.companyCodeOne,
      dashboard_text: this.tenant.companyDashboardTextOne,
      default_currency: this.tenant.currencyOne,
      countries: [this.country.id],
      implementation_contact_initial: this.tenant.implementationContactInitialOne,
      billing_contact: this.tenant.billingContactOne,
      billing_phone_number: this.phonenumber.get_belongs_to(),
      billing_email: this.email.get_belongs_to(this.email_defaults.idOne),
      implementation_email: this.email.get_belongs_to(this.email_defaults.idTwo),
      billing_address: this.address.put_belongs_to(),
    };
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
      company_code: `${this.tenant.companyCodeOne}${i}`,
      test_mode: this.tenant.test_mode,
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
  var person = require('./defaults/person');
  var phonenumber = require('../vendor/phone_number_fixtures');
  var email_defaults = require('../vendor/defaults/email');
  var email = require('../vendor/email_fixtures');
  var address = require('../vendor/address_fixtures');
  var config = require('../config/environment');
  objectAssign(BSRS_TENANT_FACTORY.prototype, mixin.prototype);
  module.exports = new BSRS_TENANT_FACTORY(tenant, currency, country, person, phonenumber, email, email_defaults, address, config);
}
else {
  define('bsrs-ember/vendor/tenant_fixtures',
    ['exports', 'bsrs-ember/vendor/defaults/tenant', 'bsrs-ember/vendor/defaults/currency', 'bsrs-ember/vendor/defaults/country', 'bsrs-ember/vendor/defaults/person', 'bsrs-ember/vendor/phone_number_fixtures', 'bsrs-ember/vendor/email_fixtures', 'bsrs-ember/vendor/defaults/email', 'bsrs-ember/vendor/address_fixtures', 'bsrs-ember/vendor/mixin', 'bsrs-ember/config/environment'],
    function(exports, tenant, currency, country, person, phonenumber, email, email_defaults, address, mixin, config) {
      'use strict';
      Object.assign(BSRS_TENANT_FACTORY.prototype, mixin.prototype);
      return new BSRS_TENANT_FACTORY(tenant, currency, country, person, phonenumber, email, email_defaults, address, config);
    }
  );
}
