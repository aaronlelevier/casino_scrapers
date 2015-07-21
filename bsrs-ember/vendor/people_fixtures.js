var BSRS_PEOPLE_FACTORY = (function() {
    var generatePerson = function(i) {
        return {
            'id': i,
            'username': 'akrier',
            'first_name': 'Andy',
            //TODO: edit middle name in form? 'middle_initial':'J',
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
        this.addresses_fixtures = address_fixtures;
        this.phone_number_fixtures = phone_number_fixtures;
    };
    factory.prototype.list = function() {
        var response = [];
        for (var i=1; i <= 5; i++) {
            response.push(generatePerson(i));
        }
        return {'count':3,'next':null,'previous':null,'results': response};
    };
    factory.prototype.detail = function(i) {
        var person = generatePerson(i);
        person.acceptassign = false;
        person.phone_numbers = this.phone_number_fixtures.get();
        person.addresses = this.addresses_fixtures.get();
        person.emails = []
        return person;
    };
    factory.prototype.put = function(i, username, first_name, last_name, title, emp_number, auth_amount, phone_numbers, addresses) {
        var response = generatePerson(i, 'PUT');
        response.role = response.role.id;
        response.status = response.status.id;
        response.title = title || response.title;
        response.username = username || response.username;
        response.first_name = first_name || response.first_name;
        response.last_name = last_name || response.last_name;
        response.emp_number = emp_number || response.emp_number;
        response.auth_amount = auth_amount || response.auth_amount;
        response.phone_numbers= phone_numbers || this.phone_number_fixtures.put();
        response.addresses= addresses || this.addresses_fixtures.put();
        response.acceptassign= false;
        response.emails= [];
        return response;
    };
    return factory;
})();

if (typeof window === 'undefined') {
    var address_fixtures = require('../vendor/address_fixtures');
    var phone_number_fixtures = require('../vendor/phone_number_fixtures');
    module.exports = new BSRS_PEOPLE_FACTORY(address_fixtures, phone_number_fixtures);
    ;
} else {
    define('bsrs-ember/vendor/people_fixtures', ['exports', 'bsrs-ember/vendor/address_fixtures', 'bsrs-ember/vendor/phone_number_fixtures'], function (exports, address_fixtures, phone_number_fixtures) {
        'use strict';
        return new BSRS_PEOPLE_FACTORY(address_fixtures, phone_number_fixtures);
    });
}
