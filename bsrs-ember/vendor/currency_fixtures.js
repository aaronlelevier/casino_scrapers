var BSRS_CURRENCY_FACTORY = (function() {
  var factory = function(currency, config) {
    this.currency = currency;
    this.config = config;
  };
  factory.prototype.generate = function(i) {
    var id = i || this.currency.id;
    return {
      id: id,
      name: this.currency.name,
    };
  };
  factory.prototype.detail = function(id) {
    return this.generate(id);
  };
  factory.prototype.put = function(currency) {
    var id = currency && currency.id || this.currency.id;
    var response = this.generate(id);
    response.currency = response.currency.id;
    for(var key in currency) {
      response[key] = currency[key];
    }
    return response;
  };
  factory.prototype.list = function() {
    var page_size = this.config.default ? this.config.default.APP.PAGE_SIZE : 10;
    return this._list(1, page_size);
  };
  factory.prototype.list_two = function() {
    var page_size = this.config.default ? this.config.default.APP.PAGE_SIZE : 10;
    return this._list(page_size+1, page_size*2);
  };
  factory.prototype.list_reverse = function() {
    var page_size = this.config.default ? this.config.default.APP.PAGE_SIZE : 10;
    let results = [];
    for(var i = page_size; i > 0; i--) {
      results.push(this._generate_item(i));
    }
    return {count: page_size*2-1, next: null, previous: null, results: results};
  };
  factory.prototype._list = function(start, end) {
    var page_size = this.config.default ? this.config.default.APP.PAGE_SIZE : 10;
    let results = [];
    for(var i = start; i <= end; i++) {
      results.push(this._generate_item(i));
    }
    return {count: page_size*2-1, next: null, previous: null, results: results};
  };
  factory.prototype._generate_item = function(i) {
    return {
      id: `${this.currency.id.slice(0,-1)}${i}`,
      name: `${this.currency.name}${i}`,
    };
  };
  return factory;
})();

if (typeof window === 'undefined') {
  var objectAssign = require('object-assign');
  var mixin = require('../vendor/mixin');
  var currency = require('./defaults/currency');
  var config = require('../config/environment');
  objectAssign(BSRS_CURRENCY_FACTORY.prototype, mixin.prototype);
  module.exports = new BSRS_CURRENCY_FACTORY(currency, config);
}
else {
  define('bsrs-ember/vendor/currency_fixtures',
    ['exports', 'bsrs-ember/vendor/defaults/currency', 'bsrs-ember/vendor/mixin', 'bsrs-ember/config/environment'],
    function(exports, currency, mixin, config) {
      'use strict';
      Object.assign(BSRS_CURRENCY_FACTORY.prototype, mixin.prototype);
      return new BSRS_CURRENCY_FACTORY(currency, config);
    }
  );
}
