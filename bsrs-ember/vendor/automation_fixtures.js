var BSRS_automation_FACTORY = (function() {
  var factory = function(automation, event, pfilter, action, actionType, ticket, person, priority, config) {
    this.automation = automation;
    this.event = event;
    this.pfilter = pfilter;
    this.action = action;
    this.actionType = actionType;
    this.ticket = ticket;
    this.person = person;
    this.priority = priority;
    this.config = config;
  };
  factory.prototype.generate = function(i) {
    var id = i || this.automation.idOne;
    return {
      id: id,
      description: this.automation.descriptionOne,
      // TODO: these are pfilters which should just be the actual filter models. ie. Ticket-Prority
      events: [{
        id: this.event.idOne,
        key: this.event.keyOne
      }],
      actions: [{
        id: this.action.idOne,
        type: {
          id: this.actionType.idOne,
          key: this.actionType.keyOne
        },
        assignee: {
          id: this.person.idOne,
          fullname: this.person.fullname
        }
      }],
      filters: [{
        id: this.pfilter.idOne,
        source_id: this.pfilter.sourceIdOne,
        key: this.pfilter.keyOne,
        field: this.pfilter.fieldOne,
        criteria: this.pfilter.criteriaOne,
        lookups: {},
      }]
    };
  };
  factory.prototype.generate_put = function(i) {
    var id = i || this.automation.idOne;
    return {
      id: id,
      description: this.automation.descriptionOne,
      // TODO: these are pfilters which should just be the actual filter models. ie. Ticket-Prority
      events: [this.event.idOne],
      actions: [{
        id: this.action.idOne,
        type: this.actionType.idOne,
        content: {
          assignee: this.person.idOne
        }
      }],
      filters: [{
        id: this.pfilter.idOne,
        source_id: this.pfilter.sourceIdOne,
        key: this.pfilter.keyOne,
        field: this.pfilter.fieldOne,
        criteria: this.pfilter.criteriaOne,
        lookups: {},
      }]
    };
  };
  factory.prototype.detail = function(id) {
    return this.generate(id);
  };
  factory.prototype.detailPriority = function(id) {
    let automation = this.detail(id);
    automation.actions = [{
      id: this.action.idTwo,
      type: {
        id: this.actionType.idTwo,
        key: this.actionType.keyTwo
      },
      priority: {
        id: this.priority.idOne,
        name: this.priority.keyOne
      }
    }];
    return automation;
  };
  factory.prototype.put = function(automation) {
    var id = automation && automation.id || this.automation.idOne;
    var response = this.generate_put(id);
    for(var key in automation) {
      response[key] = automation[key];
    }
    if (!automation.filters) {
      response.filters.forEach(function(filter) {
        delete filter.key;
        delete filter.field;
        delete filter.lookup;
        filter.source = filter.source_id;
        delete filter.source_id;
        filter.criteria = filter.criteria.map(function(criteria) {
          return criteria.id;
        });
      });
    }
    return response;
  };
  factory.prototype.list = function() {
    var page_size = this.config.default ? this.config.default.APP.PAGE_SIZE : 10;
    return this._list(1, page_size);
  };
  factory.prototype.list_pfilters = function() {
    var page_size = this.config.default ? this.config.default.APP.PAGE_SIZE : 10;
    var results = [
      {id: this.pfilter.sourceIdOne, key: this.pfilter.keyOne, field: this.pfilter.fieldOne, lookups: {}},
      {id: this.pfilter.sourceIdTwo, key: this.pfilter.keyTwo, field: this.pfilter.locationField, lookups: this.pfilter.lookupsDynamic},
      {id: this.pfilter.sourceIdFour, key: this.pfilter.categoryKey, field: this.pfilter.categoryField, lookups: {}},
      {id: this.pfilter.sourceIdFive, key: this.pfilter.stateKey, field: this.pfilter.stateField, lookups: {}},
      {id: this.pfilter.sourceIdSix, key: this.pfilter.countryKey, field: this.pfilter.countryField, lookups: {}},
      {id: this.pfilter.sourceIdSeven, key: this.pfilter.keyThree, field: this.pfilter.locationField, lookups: this.pfilter.lookupsDynamicTwo},
    ];
    return {count: 3, next: null, previous: null, results: results};
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
      id: `${this.automation.idOne.slice(0,-1)}${i}`,
      description: `${this.automation.descriptionOne}${i}`,
      events: [{
        id: `${this.event.idOne}${i}`,
        key: `${this.event.keyOne}${i}`
      }]
    };
  };
  // AutomaitonEvent power-select: put in this fixture file instead of requring
  // a new fixture file for this method only
  factory.prototype.event_search_power_select = function() {
    return {
      count: 2,
      next: null,
      previous: null,
      results: [{
        id: this.event.idOne,
        key: this.event.keyOne
      },{
        id: this.event.idTwo,
        key: this.event.keyTwo
      }]
    };
  };
  // AutomaitonActionType - place here for same reason as AutomationEvent
  factory.prototype.action_search_power_select = function() {
    return {
      count: 2,
      next: null,
      previous: null,
      results: [{
        id: this.actionType.idOne,
        key: this.actionType.keyOne
      },{
        id: this.actionType.idTwo,
        key: this.actionType.keyTwo
      }]
    };
  };
  return factory;
})();

if (typeof window === 'undefined') {
  var objectAssign = require('object-assign');
  var mixin = require('../vendor/mixin');
  var automation = require('./defaults/automation');
  var event = require('./defaults/automation-event');
  var pfilter = require('./defaults/pfilter');
  var action = require('./defaults/automation-action');
  var actionType = require('./defaults/automation-action-type');
  var ticket = require('./defaults/ticket');
  var person = require('./defaults/person');
  var priority = require('./defaults/ticket-priority');
  var config = require('../config/environment');
  objectAssign(BSRS_automation_FACTORY.prototype, mixin.prototype);
  module.exports = new BSRS_automation_FACTORY(automation, event, pfilter, action, actionType, ticket, person, priority, config);
}
else {
  define('bsrs-ember/vendor/automation_fixtures',
    ['exports', 'bsrs-ember/vendor/defaults/automation', 'bsrs-ember/vendor/defaults/automation-event', 'bsrs-ember/vendor/defaults/pfilter', 'bsrs-ember/vendor/defaults/automation-action', 'bsrs-ember/vendor/defaults/automation-action-type', 'bsrs-ember/vendor/defaults/ticket', 'bsrs-ember/vendor/defaults/person', 'bsrs-ember/vendor/defaults/ticket-priority', 'bsrs-ember/vendor/mixin', 'bsrs-ember/config/environment'],
    function(exports, automation, event, pfilter, action, actionType, ticket, person, priority, mixin, config) {
      'use strict';
      Object.assign(BSRS_automation_FACTORY.prototype, mixin.prototype);
      return new BSRS_automation_FACTORY(automation, event, pfilter, action, actionType, ticket, person, priority, config);
    }
  );
}