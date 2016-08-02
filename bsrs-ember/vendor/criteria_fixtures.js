var BSRS_AVAILABLE_FILTER_FACTORY = (function() {
  var factory = function(criteria, config) {
    this.criteria = criteria;
    this.config = config;
  };
  factory.prototype.list = function() {
    var page_size = this.config.default ? this.config.default.APP.PAGE_SIZE : 10;
    var results = [];
    for(var i = start; i <= end; i++) {
      results.push(this._generate_item(i));
    }
    return {count: page_size*2-1, next: null, previous: null, results: results};
  };
  factory.prototype._generate_item = function(i) {
    return {
      id: `${this.criteria.idOne.slice(0,-1)}${i}`,
      // key: `${this.criteria.key}${i}`,
      // key_is_i18n: false,
      // context: this.criteria.contextOne,
      // field: `${this.criteria.field}${i}`,
    };
  };
  return factory;
})();

if (typeof window === 'undefined') {
  var objectAssign = require('object-assign');
  var mixin = require('../vendor/mixin');
  var criteria = require('./defaults/criteria');
  var config = require('../config/environment');
  objectAssign(BSRS_criteria_FACTORY.prototype, mixin.prototype);
  module.exports = new BSRS_AVAILABLE_FILTER_FACTORY(criteria, criteriafilter, ticket, config);
}
else {
  define('bsrs-ember/vendor/criteria_fixtures',
    ['exports', 'bsrs-ember/vendor/defaults/criteria', 'bsrs-ember/vendor/mixin', 'bsrs-ember/config/environment'], function(exports, criteria, mixin, config) {
      'use strict';
      Object.assign(BSRS_AVAILABLE_FILTER_FACTORY.prototype, mixin.prototype);
      return new BSRS_AVAILABLE_FILTER_FACTORY(criteria, config);
    }
  );
}
