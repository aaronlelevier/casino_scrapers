var TICKET_ACTIVITY_FACTORY = (function() {
    var factory = function(person_defaults, ticket_defaults) {
        this.person_defaults = person_defaults;
        this.ticket_defaults = ticket_defaults;
    };
    factory.prototype.empty = function() {
        return {'count':0,'next':null,'previous':null,'results': []};
    };
    factory.prototype.assignee_only = function(ticket_pk) {
        var ticket_id = ticket_pk || this.ticket_defaults.idOne;
        var response = [];
        for (var i=1; i <= 2; i++) {
            var uuid = '749447cc-1a19-4d8d-829b-bfb81cb5ece';
            var activity = {id: uuid + i, type: 'assignee', created: Date.now(), ticket: ticket_id};
            activity.person = {id: this.person_defaults.idOne, fullname: this.person_defaults.fullname};
            activity.content = {to: {id: this.person_defaults.idSearch, fullname: this.person_defaults.fullnameBoy}, from: {id: this.person_defaults.idBoy, fullname: this.person_defaults.fullnameBoy2}};
            response.push(activity);
        }
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
