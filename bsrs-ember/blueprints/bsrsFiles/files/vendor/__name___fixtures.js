var BSRS_<%= CapitalizeModule %>_FACTORY = (function() {
  var factory = function(<%= camelizedModuleName %>, <%= secondModelCamel %>, config) {
    this.<%= camelizedModuleName %> = <%= camelizedModuleName %>;
    this.<%= secondModelCamel %> = <%= secondModelCamel %>;
    this.config = config;
  };
  factory.prototype.generate = function(i) {
    var id = i || this.<%= camelizedModuleName %>.idOne;
    return {
      id: id,
      <%= firstPropertySnake %>: this.<%= camelizedModuleName %>.<%= firstPropertyCamel %>One,
      <%= secondPropertySnake %>: {
        id: this.<%= camelizedModuleName %>.<%= secondPropertyCamel %>One,
        <%= secondModelDisplaySnake %>: this.<%= camelizedModuleName %>.<%= secondModelDisplaySnake %>
      }
    };
  };
  factory.prototype.detail = function(id) {
    return this.generate(id);
  };
  factory.prototype.put = function(<%= SnakeModuleName %>) {
    var id = <%= SnakeModuleName %> && <%= camelizedModuleName %>.id || this.<%= camelizedModuleName %>.idOne;
    var response = this.generate(id);
    response.<%= secondPropertySnake %> = response.<%= secondPropertySnake %>.id;
    for(var key in <%= SnakeModuleName %>) {
      response[key] = <%= SnakeModuleName %>[key];
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
      id: `${this.<%= camelizedModuleName %>.idOne.slice(0,-1)}${i}`,
      <%= firstPropertySnake %>: `${this.<%= camelizedModuleName %>.<%= firstPropertyCamel %>One}${i}`,
      <%= secondPropertySnake %>: {
        id: `${this.<%= camelizedModuleName %>.<%= secondPropertyCamel %>One.slice(0,-1)}${i}`,
        <%= secondModelDisplaySnake %>: `${this.<%= camelizedModuleName %>.<%= secondModelDisplaySnake %>}${i}`,
      },
    };
  };
  return factory;
})();

if (typeof window === 'undefined') {
  var objectAssign = require('object-assign');
  var mixin = require('../vendor/mixin');
  var <%= camelizedModuleName %> = require('./defaults/<%= dasherizedModuleName %>');
  var <%= secondModelCamel %> = require('./defaults/<%= secondModel %>');
  var config = require('../config/environment');
  objectAssign(BSRS_<%= camelizedModuleName %>_FACTORY.prototype, mixin.prototype);
  module.exports = new BSRS_<%= CapitalizeModule %>_FACTORY(<%= camelizedModuleName %>, <%= secondModelCamel %>, config);
}
else {
  define('bsrs-ember/vendor/<%= dasherizedModuleName %>_fixtures', ['exports', 'bsrs-ember/vendor/defaults/<%= dasherizedModuleName %>', 'bsrs-ember/vendor/defaults/<%= secondModel %>', 'bsrs-ember/vendor/mixin', 'bsrs-ember/config/environment'],
    function(exports, <%= dasherizedModuleName %>, <%= secondModelCamel %>, mixin, config) {
      'use strict';
      Object.assign(BSRS_<%= CapitalizeModule %>_FACTORY.prototype, mixin.prototype);
      return new BSRS_<%= CapitalizeModule %>_FACTORY(<%= dasherizedModuleName %>, <%= secondModelCamel %>, config);
    }
  );
}
