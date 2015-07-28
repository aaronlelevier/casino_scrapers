var BSRS_PEOPLE_FACTORY = (function() {
    var factory = function(address_fixtures, phone_number_fixtures, person_defaults) {
        this.address_fixtures = address_fixtures;
        this.person_defaults = person_defaults;
        this.phone_number_fixtures = phone_number_fixtures;
    };
    factory.prototype.generatePerson = function(i) {
        return {
            id: i,
            username : this.person_defaults.username,
            first_name : this.person_defaults.first_name,
            middle_initial : this.person_defaults.middle_initial,
            last_name : this.person_defaults.last_name,
            title : this.person_defaults.title,
            emp_number : this.person_defaults.emp_number,
            auth_amount : this.person_defaults.auth_amount,
            'status': {
                'id': 1,
                'name': 'admin.person.status.active'
            },
            'role': {
                'id': 2,
                'name': 'admin.role.system_administrator',
            }
        }
    },
    factory.prototype.generate = function(i) {
        return {
            id: i,
            username : this.person_defaults.username,
            first_name : this.person_defaults.first_name,
            middle_initial : this.person_defaults.middle_initial,
            last_name : this.person_defaults.last_name,
            title : this.person_defaults.title,
            emp_number : this.person_defaults.emp_number,
            auth_amount : this.person_defaults.auth_amount,
            status : {
                'id': 1,
                'name': 'admin.person.status.active'
            },
            role : {
                'id': 2,
                'name': 'admin.role.system_administrator',
            },
        }
    },
    factory.prototype.list = function() {
        var response = [];
        for (var i=1; i <= 5; i++) {
            response.push(this.generate(i));
        }
        return {'count':3,'next':null,'previous':null,'results': response};
    };
    factory.prototype.empty = function() {
        return {'count':3,'next':null,'previous':null,'results': []};
    };
    factory.prototype.detail = function(i) {
        var person = this.generate(i);
        person.acceptassign = false;
        person.phone_numbers = this.phone_number_fixtures.get();
        person.addresses = this.address_fixtures.get();
        person.emails = []
        return person;
    };
    factory.prototype.put = function(person) {
        var response = this.generatePerson(person.id);
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
    define('bsrs-ember/vendor/people_fixtures', ['exports', 'bsrs-ember/vendor/address_fixtures', 'bsrs-ember/vendor/phone_number_fixtures', 'bsrs-ember/vendor/defaults/person' ], function (exports, address_fixtures, phone_number_fixtures, person_defaults) {
        'use strict';
        return new BSRS_PEOPLE_FACTORY(address_fixtures, phone_number_fixtures, person_defaults);
    });
}
