var BSRS_TICKET_FACTORY = (function() {
    var factory = function(ticket, people_defaults, people_fixtures, location_fixtures, category_fixtures, category_defaults) {
        this.ticket = ticket;
        this.people_defaults = people_defaults.default || people_defaults;
        this.people_fixtures = people_fixtures.default || people_fixtures;
        this.location_fixtures = location_fixtures.default || location_fixtures;
        this.category_fixtures = category_fixtures.default || category_fixtures;
        this.category_defaults = category_defaults.default || category_defaults;
    };
    factory.prototype.generate = function(i) {
        var id = i || this.ticket.idOne;

        var child_category = this.category_fixtures.get(this.category_defaults.idPlumbing, this.category_defaults.nameRepairChild);
        var child_child_category = {id: this.category_defaults.idPlumbingChild, name: this.category_defaults.namePlumbingChild, parent: {id: child_category.id, name: child_category.name}, has_children: false};
        child_category.children = [child_child_category];
        child_category.has_children = true;
        child_category.parent = {id: this.category_defaults.idOne, name: this.category_defaults.nameOne};

        var unused_child_category = this.category_fixtures.get(this.category_defaults.idTwo, this.category_defaults.nameTwo);
        unused_child_category.parent = {id: this.category_defaults.idOne, name: this.category_defaults.nameOne};
        unused_child_category.parent = {id: this.category_defaults.idOne, name: this.category_defaults.nameOne};

        var parent_category = this.category_fixtures.get(this.category_defaults.idOne, this.category_defaults.nameOne);
        parent_category.children = [{id: child_category.id, name: child_category.name}, {id: unused_child_category.id, name: unused_child_category.name}];
        parent_category.has_children = true;
        parent_category.parent = null;

        return {
            id: id,
            number: this.ticket.numberOne,
            subject: this.ticket.subjectOne,
            request: this.ticket.requestOne,
            status: this.ticket.statusOneId,
            priority: this.ticket.priorityOneId,
            cc: [{id: this.people_defaults.id, fullname: this.people_defaults.fullname, email: this.people_defaults.emails, role: this.people_defaults.role}],
            categories: [parent_category, child_category, child_child_category],
            requester: this.people_fixtures.get(),
            assignee: this.people_fixtures.get(),
            location: this.location_fixtures.get()
        }
    };
    factory.prototype.list = function() {
        var response = [];
        for (var i=1; i <= 10; i++) {
            var uuid = 'bf2b9c85-f6bd-4345-9834-c5d51de53d';
            if (i < 10) {
                uuid = uuid + '0' + i;
            } else{
                uuid = uuid + i;
            }
            var ticket = this.generate(uuid);
            ticket.number = 'bye' + i;
            ticket.request = 'sub' + i;
            ticket.subject = 'diagram' + i;
            delete ticket.cc;
            delete ticket.requester;
            response.push(ticket);
        }
        //we do a reverse order sort here to verify a real sort occurs in the component
        var sorted = response.sort(function(a,b) {
            return b.id - a.id;
        });
        return {'count':19,'next':null,'previous':null,'results': sorted};
    };
    factory.prototype.list_two = function() {
        var response = [];
        for (var i=11; i <= 19; i++) {
            var uuid = 'bf2b9c85-f6bd-4345-9834-c5d51de53d';
            var ticket = this.generate(uuid + i);
            ticket.number = 'gone' + i;
            ticket.request = 'ape' + i;
            ticket.subject = 'rabbit' + i;
            delete ticket.cc;
            response.push(ticket);
        }
        return {'count':19,'next':null,'previous':null,'results': response};
    };
    factory.prototype.detail = function(i) {
        var detail = this.generate(this.ticket.idOne);
        return detail;
    };
    factory.prototype.put = function(ticket) {
        var response = this.generate(ticket.id);
        response.cc = [response.cc[0].id];
        response.requester = response.requester.id;
        response.location = response.location.id;
        response.assignee = response.assignee.id;
        response.categories = response.categories.map(function(cat) { return cat.id; });
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
    objectAssign(BSRS_TICKET_FACTORY.prototype, mixin.prototype);
    module.exports = new BSRS_TICKET_FACTORY(ticket_defaults, person_defaults, people_fixtures, location_fixtures, category_fixtures, category_defaults);
} else {
    define('bsrs-ember/vendor/ticket_fixtures', ['exports', 'bsrs-ember/vendor/defaults/ticket', 'bsrs-ember/vendor/defaults/person', 'bsrs-ember/vendor/people_fixtures', 'bsrs-ember/vendor/location_fixtures', 'bsrs-ember/vendor/category_fixtures', 'bsrs-ember/vendor/defaults/category', 'bsrs-ember/vendor/mixin'], 
           function (exports, ticket_defaults, person_defaults, people_fixtures, location_fixtures, category_fixtures, category_defaults, mixin) {
        'use strict';
        Object.assign(BSRS_TICKET_FACTORY.prototype, mixin.prototype);
        var Factory = new BSRS_TICKET_FACTORY(ticket_defaults, person_defaults, people_fixtures, location_fixtures, category_fixtures, category_defaults);
        return {default: Factory};
    });
}


