var TICKET_ACTIVITY_FACTORY = (function() {
    var factory = function(person_defaults, ticket_defaults) {
        this.person_defaults = person_defaults;
        this.ticket_defaults = ticket_defaults;
    };
    factory.prototype.empty = function() {
        return {'count':0,'next':null,'previous':null,'results': []};
    };
    factory.prototype.get_comment = function(i, ticket_pk) {
        var d = new Date();
        var ticket_id = ticket_pk || this.ticket_defaults.idOne;
        var activity = {id: i, type: 'comment', created: d.setDate(d.getDate()-90), ticket: ticket_id};
        activity.person = {id: this.person_defaults.idOne, fullname: this.person_defaults.fullname};
        activity.content = {'comment': this.ticket_defaults.commentOne};
        return activity;
    },
    factory.prototype.get_create = function(i, ticket_pk) {
        var d = new Date();
        var ticket_id = ticket_pk || this.ticket_defaults.idOne;
        var activity = {id: i, type: 'create', created: d.setDate(d.getDate()-90), ticket: ticket_id};
        activity.person = {id: this.person_defaults.idOne, fullname: this.person_defaults.fullname};
        activity.content = null;
        return activity;
    },
    factory.prototype.get_create_json = function(i, ticket_pk) {
        var activity = this.get_create(i, ticket_pk);
        activity.person_fk = activity.person.id;
        delete activity.person;
        delete activity.content;
        return activity;
    },
    factory.prototype.get_assignee = function(i, ticket_pk) {
        var d = new Date();
        var ticket_id = ticket_pk || this.ticket_defaults.idOne;
        var activity = {id: i, type: 'assignee', created: d.setDate(d.getDate()-45), ticket: ticket_id};
        activity.person = {id: this.person_defaults.idOne, fullname: this.person_defaults.fullname};
        activity.content = {to: {id: this.person_defaults.idSearch, fullname: this.person_defaults.fullnameBoy}, from: {id: this.person_defaults.idBoy, fullname: this.person_defaults.fullnameBoy2}};
        return activity;
    },
    factory.prototype.get_assignee_json = function(i, ticket_pk) {
        var activity = this.get_assignee(i, ticket_pk);
        activity.to_fk = activity.content.to.id;
        activity.from_fk = activity.content.from.id;
        activity.person_fk = activity.person.id;
        delete activity.person;
        delete activity.content;
        return activity;
    },
    factory.prototype.get_assignee_person_and_to_from_json = function(i, ticket_pk) {
        var activity = this.get_assignee(i, ticket_pk);
        return {person: activity.person, to: activity.content.to, from: activity.content.from};
    },
    factory.prototype.get_status = function(i, ticket_pk) {
        var d = new Date();
        var ticket_id = ticket_pk || this.ticket_defaults.idOne;
        var activity = {id: i, type: 'status', created: d.setDate(d.getDate()-30), ticket: ticket_id};
        activity.person = {id: this.person_defaults.idOne, fullname: this.person_defaults.fullname};
        activity.content = {to: this.ticket_defaults.statusOneId, from: this.ticket_defaults.statusTwoId};
        return activity;
    },
    factory.prototype.get_priority = function(i, ticket_pk) {
        var d = new Date();
        var ticket_id = ticket_pk || this.ticket_defaults.idOne;
        var activity = {id: i, type: 'priority', created: d.setDate(d.getDate()-60), ticket: ticket_id};
        activity.person = {id: this.person_defaults.idOne, fullname: this.person_defaults.fullname};
        activity.content = {to: this.ticket_defaults.priorityOneId, from: this.ticket_defaults.priorityTwoId};
        return activity;
    },
    factory.prototype.get_status_json = function(i, ticket_pk) {
        var activity = this.get_status(i, ticket_pk);
        activity.to_fk = activity.content.to;
        activity.from_fk = activity.content.from;
        activity.person_fk = activity.person.id;
        delete activity.person;
        delete activity.content;
        return activity;
    },
    factory.prototype.get_priority_json = function(i, ticket_pk) {
        var activity = this.get_priority(i, ticket_pk);
        activity.to_fk = activity.content.to;
        activity.from_fk = activity.content.from;
        activity.person_fk = activity.person.id;
        delete activity.person;
        delete activity.content;
        return activity;
    },
    factory.prototype.get_cc_add_remove = function(i, count, type, ticket_pk) {
        var d = new Date();
        var added_removed = [];
        for (var j=1; j <= count; j++) {
            var person = {id: '249543cf-8fea-426a-8bc3-09778cd7800' + j, fullname: this.person_defaults.fullnameBoy};
            added_removed.push(person);
        }
        var ticket_id = ticket_pk || this.ticket_defaults.idOne;
        var activity = {id: i, type: type, created: d.setDate(d.getDate()-15), ticket: ticket_id};
        activity.person = {id: this.person_defaults.idOne, fullname: this.person_defaults.fullname};
        var key = type === 'cc_add' ? 'added' : 'removed';
        activity.content = {};
        activity.content[key] = added_removed;
        return activity;
    },
    factory.prototype.get_cc_add_remove_json = function(i, count, type, ticket_pk) {
        var activity = this.get_cc_add_remove(i, count, type, ticket_pk);
        activity.person_fk = activity.person.id;
        delete activity.person;
        delete activity.content;
        return activity;
    },
    factory.prototype.created_only = function(ticket_pk) {
        var response = [];
        var uuid = '649447cc-1a19-4d8d-829b-bfb81cb5ece1';
        var activity = this.get_create(uuid, ticket_pk);
        response.push(activity);
        return {'count':1,'next':null,'previous':null,'results': response};
    };
    factory.prototype.comment_only = function(ticket_pk, count) {
        var response = [];
        var count = count || 1;
        for (var i=1; i<=count; i++) {
            var uuid = '649447cc-1a19-4d8d-829b-bfb81cb5ecw';
            var activity = this.get_comment(uuid+i, ticket_pk);
            response.push(activity);
        }
        return {'count':count,'next':null,'previous':null,'results': response};
    };
    factory.prototype.assignee_only = function(ticket_pk) {
        var response = [];
        for (var i=1; i <= 2; i++) {
            var uuid = '749447cc-1a19-4d8d-829b-bfb81cb5ece';
            var activity = this.get_assignee(uuid+i, ticket_pk);
            response.push(activity);
        }
        return {'count':2,'next':null,'previous':null,'results': response};
    };
    factory.prototype.status_only = function(ticket_pk) {
        var response = [];
        for (var i=1; i <= 3; i++) {
            var uuid = '849447cc-1a19-4d8d-829b-bfb81cb5ece';
            var activity = this.get_status(uuid+i, ticket_pk);
            response.push(activity);
        }
        return {'count':2,'next':null,'previous':null,'results': response};
    };
    factory.prototype.priority_only = function(ticket_pk) {
        var response = [];
        for (var i=1; i <= 3; i++) {
            var uuid = '049447cc-1a19-4d8d-829b-bfb81cb5ece';
            var activity = this.get_priority(uuid+i, ticket_pk);
            response.push(activity);
        }
        return {'count':2,'next':null,'previous':null,'results': response};
    };
    factory.prototype.cc_add_only = function(count, ticket_pk) {
        var uuid = '949447cc-1a19-4d8d-829b-bfb81cb5ece1';
        var activity = this.get_cc_add_remove(uuid, count, 'cc_add', ticket_pk);
        var response = [activity];
        return {'count':2,'next':null,'previous':null,'results': response};
    };
    factory.prototype.cc_remove_only = function(count, ticket_pk) {
        var uuid = '149447cc-1a19-4d8d-829b-bfb81cb5ecc1';
        var activity = this.get_cc_add_remove(uuid, count, 'cc_remove', ticket_pk);
        var response = [activity];
        return {'count':2,'next':null,'previous':null,'results': response};
    };
    return factory;
})();

if (typeof window === 'undefined') {
    var person_defaults = require('../vendor/defaults/person');
    var ticket_defaults = require('../vendor/defaults/ticket');
    module.exports = new TICKET_ACTIVITY_FACTORY(person_defaults, ticket_defaults);
} else {
    define('bsrs-ember/vendor/ticket_activity_fixtures', ['exports', 'bsrs-ember/vendor/defaults/person', 'bsrs-ember/vendor/defaults/ticket'], function (exports, person_defaults, ticket_defaults) {
        'use strict';
        var Factory = new TICKET_ACTIVITY_FACTORY(person_defaults, ticket_defaults);
        return {default: Factory};
    });
}
