var BSRS_TICKET_FACTORY = (function() {
  var factory = function(ticket, people_defaults, people_fixtures, location_fixtures, category_fixtures, category_defaults, config) {
    this.ticket = ticket;
    this.people_defaults = people_defaults.default || people_defaults;
    this.people_fixtures = people_fixtures.default || people_fixtures;
    this.location_fixtures = location_fixtures.default || location_fixtures;
    this.category_fixtures = category_fixtures.default || category_fixtures;
    this.category_defaults = category_defaults.default || category_defaults;
    this.config = config;
  };
  factory.prototype.categories = function() {
    var child_category = this.category_fixtures.generate(this.category_defaults.idPlumbing, this.category_defaults.nameRepairChild);
    var child_child_category = {id: this.category_defaults.idPlumbingChild, name: this.category_defaults.namePlumbingChild, parent_id: child_category.id, label: this.category_defaults.labelThree, children: [], level: 2};
    child_category.children = [{id:this.category_defaults.idPlumbingChild}];
    child_category.parent_id = this.category_defaults.idOne;
    child_category.label = this.category_defaults.labelTwo;
    child_category.level = 1;
    var parent_category = this.category_fixtures.generate(this.category_defaults.idOne, this.category_defaults.nameOne);
    parent_category.children = [{id: this.category_defaults.idPlumbing}, {id: this.category_defaults.idTwo}];
    parent_category.parent_id = null;
    parent_category.level = 0;
    delete parent_category.status;
    delete child_category.status;
    delete child_child_category.status;
    return [parent_category, child_category, child_child_category];
  };
  factory.prototype.generate_list = function(i, statusId, statusName) {
    var ticket = this.generate(i);
    delete ticket.status_fk;
    delete ticket.priority_fk;
    var status_id = statusId || this.ticket.statusOneId;
    var status_name = statusName || this.ticket.statusOneKey;
    ticket.status = {id: status_id, name: status_name}
    ticket.priority = {id: this.ticket.priorityOneId, name: this.ticket.priorityOneKey}
    return ticket;
  };
  factory.prototype.generate = function(i) {
    var id = i || this.ticket.idOne;
    var categories = this.categories();
    var location = this.location_fixtures.get();
    location.status_fk = location.status;
    delete location.status;
    return {
      id: id,
      number: this.ticket.numberOne,
      request: this.ticket.requestOne,
      status_fk: this.ticket.statusOneId,
      priority_fk: this.ticket.priorityOneId,
      cc: [this.people_fixtures.get()],
      categories: [categories[0], categories[1], categories[2]],
      requester: this.people_defaults.nameMel,
      assignee: this.people_fixtures.get(),
      location: location,
      attachments: []
    }
  };
  factory.prototype.list = function(statusId, statusName) {
    var response = [];
    var page_size = this.config.default ? this.config.default.APP.PAGE_SIZE : 10;
    for (var i=1; i <= page_size; i++) {
      var uuid = 'bf2b9c85-f6bd-4345-9834-c5d51de53d';
      if (i < page_size) {
        uuid = uuid + '0' + i;
      } else{
        uuid = uuid + i;
      }
      var ticket = this.generate_list(uuid, statusId, statusName);
      ticket.number = 'bye' + i;
      ticket.request = 'sub' + i;
      delete ticket.cc;
      delete ticket.attachments;
      response.push(ticket);
    }
    return {'count':page_size*2-1,'next':null,'previous':null,'results': response};
  };
  factory.prototype.list_two = function() {
    var unused_category = this.category_fixtures.get(this.category_defaults.idOne, this.category_defaults.nameOne);
    unused_category.children = [];
    unused_category.parent = null;
    var location = this.location_fixtures.get(this.ticket.locationTwoId, this.ticket.locationTwo);
    var response = [];
    var page_size = this.config.default ? this.config.default.APP.PAGE_SIZE : 10;
    for (var i=page_size+1; i <= page_size*2-1; i++) {
      var uuid = 'bf2b9c85-f6bd-4345-9834-c5d51de53d';
      var ticket = this.generate(uuid + i);
      ticket.number = 'gone' + i;
      ticket.request = 'ape' + i;
      ticket.status = {id: this.ticket.statusTwoId, name: this.ticket.statusTwoKey};
      ticket.priority = {id: this.ticket.priorityTwoId, name: this.ticket.priorityTwoKey};
      ticket.location = location;
      ticket.assignee = this.people_fixtures.get(this.ticket.assigneeTwoId, this.ticket.assigneeTwo, this.ticket.assigneeTwo);
      ticket.categories = [unused_category];
      delete ticket.cc;
      delete ticket.attachments;
      response.push(ticket);
    }
    return {'count':page_size*2-1,'next':null,'previous':null,'results': response};
  };
  factory.prototype.detail = function(i) {
    var pk = i || this.ticket.idOne;
    var detail = this.generate(pk);
    detail.attachments = [];
    return detail;
  };
  factory.prototype.put = function(ticket) {
    var response = this.generate(ticket.id);
    response.cc = [response.cc[0].id];
    response.location = response.location.id;
    response.assignee = response.assignee.id;
    response.categories = response.categories.map(function(cat) { return cat.id; });
    response.status = response.status_fk;
    response.priority =  response.priority_fk;
    delete response.status_fk;
    delete response.priority_fk;
    delete response.number;
    for(var key in ticket) {
      response[key] = ticket[key];
    }
    return response;
  };
  return factory;
})();

if (typeof window === 'undefined') {
  var objectAssign = require('object-assign');
  var mixin = require('./mixin');
  var ticket_defaults = require('./defaults/ticket');
  var person_defaults = require('./defaults/person');
  var category_fixtures = require('../vendor/category_fixtures');
  var people_fixtures = require('../vendor/people_fixtures');
  var location_fixtures = require('../vendor/location_fixtures');
  var category_defaults = require('../vendor/defaults/category');
  var config = require('../config/environment');
  objectAssign(BSRS_TICKET_FACTORY.prototype, mixin.prototype);
  module.exports = new BSRS_TICKET_FACTORY(ticket_defaults, person_defaults, people_fixtures, location_fixtures, category_fixtures, category_defaults, config);
} else {
  define('bsrs-ember/vendor/ticket_fixtures', ['exports', 'bsrs-ember/vendor/defaults/ticket', 'bsrs-ember/vendor/defaults/person', 'bsrs-ember/vendor/people_fixtures', 'bsrs-ember/vendor/location_fixtures', 'bsrs-ember/vendor/category_fixtures', 'bsrs-ember/vendor/defaults/category', 'bsrs-ember/vendor/mixin', 'bsrs-ember/config/environment'],
         function (exports, ticket_defaults, person_defaults, people_fixtures, location_fixtures, category_fixtures, category_defaults, mixin, config) {
         'use strict';
         Object.assign(BSRS_TICKET_FACTORY.prototype, mixin.prototype);
         var Factory = new BSRS_TICKET_FACTORY(ticket_defaults, person_defaults, people_fixtures, location_fixtures, category_fixtures, category_defaults, config);
         return {default: Factory};
});
}
