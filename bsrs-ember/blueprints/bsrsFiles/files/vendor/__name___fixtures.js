var BSRS_<%= CapitalizeModule %>_FACTORY = (function() {
  var factory = function(<%= camelizedModuleName %>) {
    this.<%= camelizedModuleName %> = <%= camelizedModuleName %>;
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
    return this._list(0, 20);
  };
  factory.prototype.list_two = function() {
    return this._list(10, 20);
  };
  factory.prototype.list_reverse = function() {
    const page_size = 10;
    let results = [];
    for(var i = page_size; i > 0; i--) {
      results.push(this._generate_item(i));
    }
    return {count: page_size-1, next: null, previous: null, results: results};
  };
  factory.prototype._list = function(start, page_size) {
    let results = [];
    for(var i = start; i < page_size; i++) {
      results.push(this._generate_item(i));
    }
    return {count: page_size-1, next: null, previous: null, results: results};
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
  objectAssign(BSRS_<%= camelizedModuleName %>_FACTORY.prototype, mixin.prototype);
  module.exports = new BSRS_<%= CapitalizeModule %>_FACTORY(<%= camelizedModuleName %>);
}
else {
  define('bsrs-ember/vendor/<%= dasherizedModuleName %>_fixtures', ['exports', 'bsrs-ember/vendor/defaults/<%= dasherizedModuleName %>', 'bsrs-ember/vendor/mixin'],
    function(exports, <%= dasherizedModuleName %>, mixin) {
      'use strict';
      Object.assign(BSRS_<%= CapitalizeModule %>_FACTORY.prototype, mixin.prototype);
      return new BSRS_<%= CapitalizeModule %>_FACTORY(<%= dasherizedModuleName %>);
    }
  );
}
