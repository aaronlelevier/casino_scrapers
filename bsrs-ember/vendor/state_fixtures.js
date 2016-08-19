var BSRS_STATE_FACTORY = (function() {
  var factory = function(config, state) {
    this.config = config;
    this.state = state;
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
      id: `${this.state.id.slice(0,-1)}${i}`,
      name: `${this.state.name}${i}`
    };
  };
  return factory;
})();

if (typeof window === 'undefined') {
  var config = require('../config/environment');
  var state = require('./defaults/state');
  module.exports = new BSRS_STATE_FACTORY(config, state);
}
else {
  define('bsrs-ember/vendor/state_fixtures', ['exports', 'bsrs-ember/config/environment', 'bsrs-ember/vendor/defaults/state'], function(exports, config, state) {
    'use strict';
    return new BSRS_STATE_FACTORY(config, state);
  });
}