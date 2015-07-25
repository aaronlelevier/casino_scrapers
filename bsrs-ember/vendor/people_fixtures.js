var BSRS_PEOPLE_FACTORY = (function() {
    var generatePerson = function(i) {
        return {
            'id': i,
            'username': 'akrier',
            'first_name': 'Andy',
            'middle_initial':'M',
            'last_name': 'Krier',
            'title': 'RVP',
            'emp_number': '5063',
            'auth_amount': '50000.0000',
            'status': {
                'id': 1,
                'name': 'admin.person.status.active'
            },
            'role': {
                'id': 2,
                'name': 'admin.role.system_administrator',
            }
        }
    };
    var factory = function(address_fixtures, phone_number_fixtures) {
        this.address_fixtures = address_fixtures;
        this.phone_number_fixtures = phone_number_fixtures;
    };
    factory.prototype.list = function() {
        var response = [];
        for (var i=1; i <= 5; i++) {
            response.push(generatePerson(i));
        }
        return {'count':3,'next':null,'previous':null,'results': response};
    };
    factory.prototype.empty = function() {
        return {'count':3,'next':null,'previous':null,'results': []};
    };
    factory.prototype.detail = function(i) {
        var person = generatePerson(i);
        person.acceptassign = false;
        person.phone_numbers = this.phone_number_fixtures.get();
        person.addresses = this.address_fixtures.get();
        person.emails = []
        return person;
    };
    factory.prototype.put = function(person) {
        var response = generatePerson(person.id);
        response.phone_numbers = this.phone_number_fixtures.put();
        response.addresses = this.address_fixtures.put();
        response.role = response.role.id;
        response.status = response.status.id;
        response.acceptassign= false;
        response.emails= [];
        for(var key in person) {
           response[key] = person[key];
        }
        return response;
    };
    return factory;
})();

if (typeof window === 'undefined') {
    var address_fixtures = require('../vendor/address_fixtures');
    var phone_number_fixtures = require('../vendor/phone_number_fixtures');
    module.exports = new BSRS_PEOPLE_FACTORY(address_fixtures, phone_number_fixtures);
} else {
    define('bsrs-ember/vendor/people_fixtures', ['exports', 'bsrs-ember/vendor/address_fixtures', 'bsrs-ember/vendor/phone_number_fixtures'], function (exports, address_fixtures, phone_number_fixtures) {
        'use strict';
        return new BSRS_PEOPLE_FACTORY(address_fixtures, phone_number_fixtures);
    });
}
