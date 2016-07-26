var BSRS_TICKET_FACTORY = (function() {
  var factory = function(ticket, people_defaults, people_fixtures, location_fixtures, category_fixtures, category_defaults, dtd_defaults, field_defaults, option_defaults, config) {
    this.ticket = ticket;
    this.people_defaults = people_defaults.default || people_defaults;
    this.people_fixtures = people_fixtures.default || people_fixtures;
    this.location_fixtures = location_fixtures.default || location_fixtures;
    this.category_fixtures = category_fixtures.default || category_fixtures;
    this.category_defaults = category_defaults.default || category_defaults;
    this.dtd_defaults = dtd_defaults.default || dtd_defaults;
    this.field_defaults = field_defaults.default || field_defaults;
    this.option_defaults = option_defaults.default || option_defaults;
    this.config = config;
  };
  factory.prototype.categories = function() {
    var child_category = this.category_fixtures.generate_for_power_select(this.category_defaults.idPlumbing, this.category_defaults.nameRepairChild);
    var child_child_category = {id: this.category_defaults.idPlumbingChild, name: this.category_defaults.namePlumbingChild, parent_id: child_category.id, label: this.category_defaults.labelThree, children: [], level: 2};
    child_category.children = [{id:this.category_defaults.idPlumbingChild}];
    child_category.parent_id = this.category_defaults.idOne;
    child_category.label = this.category_defaults.labelTwo;
    child_category.level = 1;
    var parent_category = this.category_fixtures.generate_for_power_select(this.category_defaults.idOne, this.category_defaults.nameOne);
    parent_category.children = [{id: this.category_defaults.idPlumbing}, {id: this.category_defaults.idTwo}];
    parent_category.parent_id = null;
    parent_category.level = 0;
    delete parent_category.status;
    delete child_category.status;
    delete child_child_category.status;
    return [parent_category, child_category, child_child_category];
  };
  factory.prototype.generate_list = function(i, statusId, statusName) {
    var status_id = statusId || this.ticket.statusOneId;
    var status_name = statusName || this.ticket.statusOneKey;
    var person = this.people_fixtures.get_no_related();
    delete person.first_name;
    delete person.last_name;
    delete person.title;
    //TODO: need to include category_ids
    return {
      id: i,
      number: this.ticket.numberOne,
      request: this.ticket.requestOne,
      status: {id: status_id, name: status_name},
      priority: {id: this.ticket.priorityOneId, name: this.ticket.priorityOneKey},
      assignee: this.people_fixtures.get_no_related(),
      location: this.location_fixtures.get_no_related(),
      categories: this.categories(),
      requester: this.people_defaults.nameMel,
    }
  };
  factory.prototype.generate = function(i, status_id, dt_path) {
    var id = i || this.ticket.idOne;
    var categories = this.categories();
    var location = this.location_fixtures.get();
    location.status_fk = location.status;
    delete location.status;
    return {
      id: id,
      number: this.ticket.numberOne,
      request: this.ticket.requestOne,
      status_fk: status_id || this.ticket.statusOneId,
      priority_fk: this.ticket.priorityOneId,
      cc: [this.people_fixtures.get_no_related()],
      categories: [categories[0], categories[1], categories[2]],
      requester: this.people_defaults.nameMel,
      assignee: this.people_fixtures.get(),
      location: location,
      attachments: [],
      dt_path: dt_path || [{ //need to improve this dt_path object to reflect what it will actually look like (dtd needs more)
        ticket: {
          id: this.ticket.idOne,
          requester: '',
          location: this.ticket.locationOneId,
          status: this.ticket.statusOneId,
          priority: this.ticket.priorityOneId,
          request: ["label: wat", "label: foo"],
          categories: [this.category_defaults.idOne, this.category_defaults.idTwo],
          cc: [],
          attachments: [],
        },
        dtd: {
          id: this.dtd_defaults.idOne,
          description: this.dtd_defaults.descriptionOne,
          prompt: this.dtd_defaults.promptOne,
          note: this.dtd_defaults.noteOne,
        }
      }, {
        ticket: {
          id: this.ticket.idTwo,
          requester: '',
          location: this.ticket.locationOneId,
          status: this.ticket.statusOneId,
          priority: this.ticket.priorityOneId,
          request: ["label: wat", "label: foo"],
          categories: [this.category_defaults.idOne, this.category_defaults.idTwo],
          cc: [],
          attachments: [],
        },
        dtd: {
          id: this.dtd_defaults.idTwo,
          description: this.dtd_defaults.descriptionTwo,
          prompt: this.dtd_defaults.promptOne,
          note: this.dtd_defaults.noteOne,
        }
      }],
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
      ticket.request = 'subb' + i;
      delete ticket.cc;
      delete ticket.attachments;
      response.push(ticket);
    }
    return {'count':page_size*2-1,'next':null,'previous':null,'results': response};
  };
  factory.prototype.list_two = function(page) {
    var unused_category = this.category_fixtures.get(this.category_defaults.idOne, this.category_defaults.nameOne);
    unused_category.children = [];
    unused_category.parent = null;
    var location = this.location_fixtures.get(this.ticket.locationTwoId, this.ticket.locationTwo);
    var response = [];
    var page_size = this.config.default ? this.config.default.APP.PAGE_SIZE : 10;
    page = page || ''; //page may come in as undefined
    for (var i=page_size+1; i <= page_size*2-1; i++) {
      var uuid = 'bf2b9c85-f6bd-4345-9834-c5d51de53d' + i + page;
      var ticket = this.generate(uuid + i);
      ticket.number = 'gone' + i;
      ticket.request = 'ape'+ i;
      ticket.status = {id: this.ticket.statusTwoId, name: this.ticket.statusTwoKey};
      ticket.priority = {id: this.ticket.priorityTwoId, name: this.ticket.priorityTwoKey};
      ticket.location = location;
      ticket.assignee = this.people_fixtures.get_no_related(this.ticket.assigneeTwoId, this.ticket.assigneeTwo, this.ticket.assigneeTwo);
      ticket.categories = [unused_category];
      delete ticket.cc;
      delete ticket.attachments;
      response.push(ticket);
    }
    return {'count':page_size*2-1,'next':null,'previous':null,'results': response};
  };
  factory.prototype.detail = function(i, status_id, dt_path) {
    var pk = i || this.ticket.idOne;
    var detail = this.generate(pk, status_id, dt_path);
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
  var dtd_defaults = require('../vendor/defaults/dtd');
  var field_defaults = require('../vendor/defaults/field');
  var options_defaults = require('../vendor/defaults/option');
  var config = require('../config/environment');
  objectAssign(BSRS_TICKET_FACTORY.prototype, mixin.prototype);
  module.exports = new BSRS_TICKET_FACTORY(ticket_defaults, person_defaults, people_fixtures, location_fixtures, category_fixtures, category_defaults, dtd_defaults, field_defaults, options_defaults, config);
} else {
  define('bsrs-ember/vendor/ticket_fixtures', ['exports', 'bsrs-ember/vendor/defaults/ticket', 'bsrs-ember/vendor/defaults/person', 'bsrs-ember/vendor/people_fixtures', 'bsrs-ember/vendor/location_fixtures', 'bsrs-ember/vendor/category_fixtures', 'bsrs-ember/vendor/defaults/category', 'bsrs-ember/vendor/defaults/dtd', 'bsrs-ember/vendor/defaults/field', 'bsrs-ember/vendor/defaults/option', 'bsrs-ember/vendor/mixin', 'bsrs-ember/config/environment'],
         function (exports, ticket_defaults, person_defaults, people_fixtures, location_fixtures, category_fixtures, category_defaults, dtd_defaults, field_defaults, option_defaults, mixin, config) {
         'use strict';
         Object.assign(BSRS_TICKET_FACTORY.prototype, mixin.prototype);
         var Factory = new BSRS_TICKET_FACTORY(ticket_defaults, person_defaults, people_fixtures, location_fixtures, category_fixtures, category_defaults, dtd_defaults, field_defaults, option_defaults, config);
         return {default: Factory};
});
}
