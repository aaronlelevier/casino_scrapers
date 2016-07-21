var BSRS_PROFILE_FACTORY = (function() {
  var factory = function(profile, pfilter, ticket) {
    this.profile = profile;
    this.pfilter = pfilter;
    this.ticket = ticket;
  };
  factory.prototype.generate = function(i) {
    var id = i || this.profile.idOne;
    return {
      id: id,
      description: this.profile.descOne,
      assignee: {
        id: this.profile.assigneeOne,
        username: this.profile.username
      },
      filters: [{
        id: this.pfilter.idOne,
        key: this.pfilter.keyOne,
        context: this.pfilter.contextOne,
        field: this.pfilter.fieldOne,
        criteria: [this.ticket.priorityOneId]
      }]
    };
  };
  factory.prototype.detail = function(id) {
    return this.generate(id);
  };
  factory.prototype.put = function(id) {
    return this.generate();
  };
  factory.prototype.list = function() {
    return this._list(0, 20);
  };
  factory.prototype.list_two = function() {
    return this._list(10, 20);
  };
  factory.prototype.list_reverse = function() {
    const page_size = 10;
    var results = [];
    for(var i = page_size; i > 0; i--) {
      results.push(this._generate_item(i));
    }
    return {count: page_size-1, next: null, previous: null, results: results};
  };
  factory.prototype._list = function(start, page_size) {
    var results = [];
    for(var i = start; i < page_size; i++) {
      results.push(this._generate_item(i));
    }
    return {count: page_size-1, next: null, previous: null, results: results};
  };
  factory.prototype._generate_item = function(i) {
    return {
      id: `${this.profile.idOne.slice(0,-1)}${i}`,
      description: `${this.profile.descOne}${i}`,
      assignee: {
        id: `${this.profile.assigneeOne.slice(0,-1)}${i}`,
        username: `${this.profile.username}${i}`,
      }
    };
  };
  return factory;
})();

if (typeof window === 'undefined') {
  var objectAssign = require('object-assign');
  var mixin = require('../vendor/mixin');
  var profile = require('./defaults/profile');
  var pfilter = require('./defaults/profile-filter');
  var ticket = require('./defaults/ticket');
  objectAssign(BSRS_PROFILE_FACTORY.prototype, mixin.prototype);
  module.exports = new BSRS_PROFILE_FACTORY(profile, pfilter, ticket);
}
else {
  define('bsrs-ember/vendor/profile_fixtures',
    ['exports', 'bsrs-ember/vendor/defaults/profile', 'bsrs-ember/vendor/defaults/profile-filter', 'bsrs-ember/vendor/defaults/ticket', 'bsrs-ember/vendor/mixin'],
    function(exports, profile, pfilter, ticket, mixin) {
      'use strict';
      Object.assign(BSRS_PROFILE_FACTORY.prototype, mixin.prototype);
      return new BSRS_PROFILE_FACTORY(profile, pfilter, ticket);
    }
  );
}
