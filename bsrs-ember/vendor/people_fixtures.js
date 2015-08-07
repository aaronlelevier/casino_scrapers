var BSRS_PEOPLE_FACTORY = (function() {
    var factory = function(address_fixtures, phone_number_fixtures, person_defaults, role_defaults, status_defaults) {
        this.address_fixtures = address_fixtures;
        this.person_defaults = person_defaults;
        this.phone_number_fixtures = phone_number_fixtures;
        this.role_defaults = role_defaults;
        this.status_defaults = status_defaults;
    };
    factory.prototype.generate = function(i) {
        return {
            id: i,
            username : this.person_defaults.username,
            first_name : this.person_defaults.first_name,
            middle_initial : this.person_defaults.middle_initial,
            last_name : this.person_defaults.last_name,
            title : this.person_defaults.title,
            emp_number : this.person_defaults.emp_number,
            location : '',
            auth_amount : this.person_defaults.auth_amount,
            status : {
                'id': this.status_defaults.activeId,
                'name': 'admin.person.status.active'
            },
            role : {
                'id': this.role_defaults.idOne,
                'name': 'admin.role.system_administrator',
            },
            emails: this.person_defaults.emails
        }
    },
    factory.prototype.list = function() {
        var response = [];
        for (var i=1; i <= 5; i++) {
            var uuid = '139543cf-8fea-426a-8bc3-09778cd7995';
            response.push(this.generate(uuid + i));
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
        person.phone_numbers.forEach(function(num) {
            num.person_id = i;
        });
        person.addresses = this.address_fixtures.get();
        person.addresses.forEach(function(add) {
            add.person_id = i;
        });
        person.emails = []
        return person;
    };
    factory.prototype.put = function(person) {
        var response = this.generate(person.id);
        response.phone_numbers = this.phone_number_fixtures.put();
        response.addresses = this.address_fixtures.put();
        response.status = this.status_defaults.activeId;
        response.role = this.role_defaults.idOne;
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
    var person_defaults = require('../vendor/defaults/person');
    var role_defaults = require('../vendor/defaults/role');
    var status_defaults = require('../vendor/defaults/status');
    module.exports = new BSRS_PEOPLE_FACTORY(address_fixtures, phone_number_fixtures, person_defaults, role_defaults, status_defaults);
} else {
    define('bsrs-ember/vendor/people_fixtures', ['exports', 'bsrs-ember/vendor/address_fixtures', 'bsrs-ember/vendor/phone_number_fixtures', 'bsrs-ember/vendor/defaults/person', 'bsrs-ember/vendor/defaults/role', 'bsrs-ember/vendor/defaults/status'], function (exports, address_fixtures, phone_number_fixtures, person_defaults, role_defaults, status_defaults) {
        'use strict';
        return new BSRS_PEOPLE_FACTORY(address_fixtures, phone_number_fixtures, person_defaults, role_defaults, status_defaults);
    });
}
