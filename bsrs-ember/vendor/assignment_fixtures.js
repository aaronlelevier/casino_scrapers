var BSRS_ASSIGNMENT_FACTORY = (function() {
  var factory = function(assignment, pfilter, ticket, config) {
    this.assignment = assignment;
    this.pfilter = pfilter;
    this.ticket = ticket;
    this.config = config;
  };
  factory.prototype.generate = function(i) {
    var id = i || this.assignment.idOne;
    return {
      id: id,
      description: this.assignment.descriptionOne,
      assignee: {
        id: this.assignment.assigneeOne,
        fullname: this.assignment.fullname
      },
      filters: [{
        id: this.pfilter.idOne,
        criteria: [this.ticket.priorityOneId]
      }]
    };
  };
  factory.prototype.detail = function(id) {
    return this.generate(id);
  };
  factory.prototype.put = function(assignment) {
    var id = assignment && assignment.id || this.assignment.idOne;
    var response = this.generate(id);
    response.assignee = response.assignee.id;
    for(var key in assignment) {
      response[key] = assignment[key];
    }
    return response;
  };
  factory.prototype.list = function() {
    var page_size = this.config.default ? this.config.default.APP.PAGE_SIZE : 10;
    return this._list(1, page_size);
  };
  factory.prototype.list_two = function() {
    var page_size = this.config.default ? this.config.default.APP.PAGE_SIZE : 10;
    return this._list(page_size+1, 20);
  };
  factory.prototype.list_reverse = function() {
    var page_size = this.config.default ? this.config.default.APP.PAGE_SIZE : 10;
    var results = [];
    for(var i = page_size; i > 0; i--) {
      results.push(this._generate_item(i));
    }
    return {count: page_size-1, next: null, previous: null, results: results};
  };
  factory.prototype._list = function(start, end) {
    var page_size = this.config.default ? this.config.default.APP.PAGE_SIZE : 10;
    var results = [];
    for(var i = start; i <= end; i++) {
      results.push(this._generate_item(i));
    }
    return {count: page_size*2-1, next: null, previous: null, results: results};
  };
  factory.prototype._generate_item = function(i) {
    return {
      id: `${this.assignment.idOne.slice(0,-1)}${i}`,
      description: `${this.assignment.descriptionOne}${i}`,
      assignee: {
        id: `${this.assignment.assigneeOne.slice(0,-1)}${i}`,
        fullname: `${this.assignment.fullname}${i}`,
      }
    };
  };
  return factory;
})();

if (typeof window === 'undefined') {
  var objectAssign = require('object-assign');
  var mixin = require('../vendor/mixin');
  var assignment = require('./defaults/assignment');
  var pfilter = require('./defaults/pfilter');
  var ticket = require('./defaults/ticket');
  var config = require('../config/environment');
  objectAssign(BSRS_assignment_FACTORY.prototype, mixin.prototype);
  module.exports = new BSRS_ASSIGNMENT_FACTORY(assignment, pfilter, ticket, config);
}
else {
  define('bsrs-ember/vendor/assignment_fixtures', ['exports', 'bsrs-ember/vendor/defaults/assignment', 'bsrs-ember/vendor/defaults/pfilter',
   'bsrs-ember/vendor/defaults/ticket', 'bsrs-ember/vendor/mixin', 'bsrs-ember/config/environment'],
    function(exports, assignment, pfilter, ticket, mixin, config) {
      'use strict';
      Object.assign(BSRS_ASSIGNMENT_FACTORY.prototype, mixin.prototype);
      return new BSRS_ASSIGNMENT_FACTORY(assignment, pfilter, ticket, config);
    }
  );
}
