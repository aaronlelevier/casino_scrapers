var BSRS_TICKET = (function() {
    var factory = function(ticket) {
        this.ticket = ticket;
    };
    // factory.prototype.get = function(i) {
    //     return {
    //         id: i || this.ticket.idOne,
    //         name: this.ticket.nameOne,
    //         number: this.ticket.numberOne,
    //     }
    // },
    factory.prototype.generate = function(i) {
        var id = i || this.ticket.idOne;
        return {
            id: id,
            number: this.ticket.numberOne,
            subject: this.ticket.subjectOne,
            status: this.ticket.statusOneId,
            priority: this.ticket.priorityOneId,
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
            ticket.number = ticket.number + i;
            response.push(ticket);
        }
        //we do a reverse order sort here to verify a real sort occurs in the component
        // var sorted = response.sort(function(a,b) {
        //     return b.id - a.id;
        // });
        return {'count':19,'next':null,'previous':null,'results': response};
    };
    // factory.prototype.list_two = function() {
    //     var response = [];
    //     for (var i=11; i <= 19; i++) {
    //         var uuid = '232z46cf-9fbb-456z-4hc3-59728vu3099';
    //         var ticket = this.generate(uuid + i);
    //         ticket.name = 'vzoname' + i;
    //         ticket.number = 'sconumber' + i;
    //         response.push(ticket);
    //     }
    //     return {'count':19,'next':null,'previous':null,'results': response};
    // };
    factory.prototype.detail = function(i) {
        return this.generate(this.ticket.idOne);
    };
    factory.prototype.put = function(ticket) {
        var response = this.generate(ticket.id);
        for(var key in ticket) {
            response[key] = ticket[key];
        }
        return response;
    };
    return factory;
})();

if (typeof window === 'undefined') {
    // var objectAssign = require('object-assign');
    // var mixin = require('../vendor/mixin');
    var ticket = require('../vendor/defaults/ticket');
    // objectAssign(BSRS_TICKET.prototype, mixin.prototype);
    module.exports = new BSRS_TICKET(ticket);
} else {
    define('bsrs-ember/vendor/ticket_fixtures', ['exports', 'bsrs-ember/vendor/defaults/ticket'], function (exports, ticket) {
        'use strict';
        // Object.assign(BSRS_TICKET.prototype, mixin.prototype);
        return new BSRS_TICKET(ticket);
        // return {default: Factory};
    });
}


