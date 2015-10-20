var BSRS_TICKET_FACTORY = (function() {
    var factory = function(ticket, person, category_fixtures, category_defaults) {
        this.ticket = ticket;
        this.person = person;
        this.category_fixtures = category_fixtures.default || category_fixtures;
        this.category_defaults = category_defaults.default || category_defaults;
    };
    factory.prototype.generate = function(i) {
        var id = i || this.ticket.idOne;
        var parent_category = this.category_fixtures.get(this.category_defaults.idOne, this.category_defaults.nameOne);
        var child_category = this.category_fixtures.get(this.category_defaults.unusedId, this.category_defaults.nameRepairChild);
        child_category.parent = {id: this.category_defaults.idOne, name: this.category_defaults.nameOne};
        parent_category.parent = null;
        return {
            id: id,
            number: this.ticket.numberOne,
            subject: this.ticket.subjectOne,
            request: this.ticket.requestOne,
            status: this.ticket.statusOneId,
            priority: this.ticket.priorityOneId,
            cc: [{id: this.person.id, fullname: this.person.fullname, email: this.person.emails, role: this.person.role}],
            categories: [parent_category, child_category]
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
    var category_defaults = require('../vendor/defaults/category');
    objectAssign(BSRS_TICKET_FACTORY.prototype, mixin.prototype);
    module.exports = new BSRS_TICKET_FACTORY(ticket_defaults, person_defaults, category_fixtures, category_defaults);
} else {
    define('bsrs-ember/vendor/ticket_fixtures', ['exports', 'bsrs-ember/vendor/defaults/ticket', 'bsrs-ember/vendor/defaults/person', 'bsrs-ember/vendor/category_fixtures', 'bsrs-ember/vendor/defaults/category', 'bsrs-ember/vendor/mixin'], function (exports, ticket_defaults, person_defaults, category_fixtures, category_defaults, mixin) {
        'use strict';
        Object.assign(BSRS_TICKET_FACTORY.prototype, mixin.prototype);
        var Factory = new BSRS_TICKET_FACTORY(ticket_defaults, person_defaults, category_fixtures, category_defaults);
        return {default: Factory};
    });
}


