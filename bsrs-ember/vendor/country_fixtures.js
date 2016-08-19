var BSRS_COUNTRY_FACTORY = (function() {
  var factory = function(config, country) {
    this.config = config;
    this.country = country;
  };
  factory.prototype.list_power_select = function() {
    var page_size = this.config.default ? this.config.default.APP.PAGE_SIZE : 10;
    var results = [];
    for (var i = 0; i <= page_size; i++) {
      results.push(this._generate_item(i));
    }
    return {
      count: page_size * 2 - 1,
      next: null,
      previous: null,
      results: results
    };
  };
  factory.prototype._generate_item = function(i) {
    return {
      id: `${this.country.id.slice(0,-1)}${i}`,
      name: `${this.country.name}${i}`
    };
  };
  return factory;
})();

if (typeof window === 'undefined') {
  var config = require('../config/environment');
  var country = require('./defaults/country');
  module.exports = new BSRS_COUNTRY_FACTORY(config, country);
}
else {
  define('bsrs-ember/vendor/country_fixtures', ['exports', 'bsrs-ember/config/environment', 'bsrs-ember/vendor/defaults/country'], function(exports, config, country) {
    'use strict';
    return new BSRS_COUNTRY_FACTORY(config, country);
  });
}