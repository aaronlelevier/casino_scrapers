var BSRS_AVAILABLE_FILTER_FACTORY = (function() {
  var factory = function(afilter, config) {
    this.afilter = afilter;
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
      id: `${this.afilter.idOne.slice(0,-1)}${i}`,
      key: `${this.afilter.key}${i}`,
      key_is_i18n: false,
      context: this.afilter.contextOne,
      field: `${this.afilter.field}${i}`,
    };
  };
  return factory;
})();

if (typeof window === 'undefined') {
  var objectAssign = require('object-assign');
  var mixin = require('../vendor/mixin');
  var afilter = require('./defaults/afilter');
  var config = require('../config/environment');
  objectAssign(BSRS_afilter_FACTORY.prototype, mixin.prototype);
  module.exports = new BSRS_AVAILABLE_FILTER_FACTORY(afilter, afilterfilter, ticket, config);
}
else {
  define('bsrs-ember/vendor/afilter_fixtures',
    ['exports',
     'bsrs-ember/vendor/defaults/afilter',
     'bsrs-ember/vendor/mixin',
     'bsrs-ember/config/environment'],
    function(exports, afilter, mixin, config) {
      'use strict';
      Object.assign(BSRS_AVAILABLE_FILTER_FACTORY.prototype, mixin.prototype);
      return new BSRS_AVAILABLE_FILTER_FACTORY(afilter, config);
    }
  );
}
