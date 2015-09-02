var BSRS_PEOPLE_FACTORY = (function() {
    var factory = function(address_fixtures, phone_number_fixtures, person_defaults, role_defaults, status_defaults, location_level_defaults, role_fixtures, location_fixtures) {
        this.address_fixtures = address_fixtures;
        this.person_defaults = person_defaults;
        this.phone_number_fixtures = phone_number_fixtures;
        this.role_fixtures = role_fixtures;
        this.location_fixtures = location_fixtures;
        this.role_defaults = role_defaults;
        this.status_defaults = status_defaults;
        this.location_level_defaults = location_level_defaults;
    };
    factory.prototype.generate = function(i) {
        return {
            id: i,
            username : this.person_defaults.username,
            first_name : this.person_defaults.first_name,
            middle_initial : this.person_defaults.middle_initial,
            last_name : this.person_defaults.last_name,
            title : this.person_defaults.title,
            employee_id : this.person_defaults.employee_id,
            auth_amount : this.person_defaults.auth_amount,
            status : {
                'id': this.status_defaults.activeId,
                'name': 'admin.person.status.active'
            },
            role: this.role_fixtures.get(),
            emails: this.person_defaults.emails,
            locations: [],
            phone_numbers: [],
            addresses: []
        }
    },
    factory.prototype.generate_single_for_list = function(i) {
        var person = this.generate(i);
        delete person.locations;
        delete person.phone_numbers;
        delete person.addresses;
        // delete person.role.location_level;
        // delete person.role.role_type;
        return person;
    },
    factory.prototype.list = function() {
        var response = [];
        for (var i=1; i <= 10; i++) {
            var uuid = '139543cf-8fea-426a-8bc3-09778cd799';
            if (i < 10) {
                uuid = uuid + '0' + i;
            } else{
                uuid = uuid + i;
            }
            var person = this.generate(uuid);
            delete person.locations;
            delete person.phone_numbers;
            delete person.addresses;
            // delete person.role.location_level;
            // delete person.role.role_type;
            //TODO: DRY this up
            person.username = 'mgibson' + i;
            person.first_name = 'Mel' + i;
            person.last_name = 'Gibson' + i;
            person.title = i + ' MVP';
            response.push(person);
        }
        //we do a reverse order sort here to verify a real sort occurs in the component
        var sorted = response.sort(function(a,b) {
            return b.id - a.id;
        });
        return {'count':18,'next':null,'previous':null,'results': sorted};
    };
    factory.prototype.list_two = function() {
        var response = [];
        for (var i=11; i <= 18; i++) {
            var uuid = '139543cf-8fea-426a-8bc3-09778cd799';
            var person = this.generate(uuid + i);
            delete person.locations;
            delete person.phone_numbers;
            delete person.addresses;
            // delete person.role.location_level;
            // delete person.role.role_type;
            person.username = 'scott' + i;
            person.first_name = 'Scott' + i;
            person.last_name = 'Newcomer' + i;
            person.title = i + ' WAT';
            response.push(person);
        }
        return {'count':18,'next':null,'previous':null,'results': response};
    };
    factory.prototype.sorted = function(column, page) {
        var response;
        if(page && page === 2) {
            response = this.list_two().results;
        } else {
            response = this.list().results;
        }
        //we do a reverse order sort here to verify a real sort occurs in the component
        var sorted = response.sort(function(a,b) {
            return b[column] - a[column];
        });
        return {'count':18,'next':null,'previous':null,'results': sorted};
    };
    factory.prototype.searched = function(search, column, page) {
        var page1 = this.list_two().results;
        var page2 = this.list().results;
        var response = page1.concat(page2);
        //we do a normal order sort here to slice correctly below
        var sorted = response.sort(function(a,b) {
            return a[column] - b[column];
        });
        var regex = new RegExp(search);
        var searched = sorted.filter(function(object) {
            var value = object.username;
            return regex.test(value);
        });
        var paged;
        if(page && page > 1) {
            paged = searched.slice(10, 20);
        } else {
            paged = searched.slice(0, 10);
        }
        return {'count':searched.length,'next':null,'previous':null,'results': paged};
    };
    factory.prototype.empty = function() {
        return {'count':0,'next':null,'previous':null,'results': []};
    };
    factory.prototype.detail = function(i) {
        var person = this.generate(i);
        person.acceptassign = false;
        person.phone_numbers = this.phone_number_fixtures.get();
        person.addresses = this.address_fixtures.get();
        person.emails = [];
        person.locale = this.person_defaults.locale;
        return person;
    };
    factory.prototype.put = function(person) {
        var response = this.generate(person.id);
        response.phone_numbers = this.phone_number_fixtures.put();
        response.addresses = this.address_fixtures.put();
        response.status = this.status_defaults.activeId;
        response.role = this.role_defaults.idOne;
        person.locale = this.person_defaults.locale_id;
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
    var role_fixtures = require('../vendor/role_fixtures');
    var person_defaults = require('../vendor/defaults/person');
    var role_defaults = require('../vendor/defaults/role');
    var status_defaults = require('../vendor/defaults/status');
    var location_level_defaults = require('../vendor/defaults/location-level');
    var location_fixtures = require('../vendor/location_fixtures');
    module.exports = new BSRS_PEOPLE_FACTORY(address_fixtures, phone_number_fixtures, person_defaults, role_defaults, status_defaults, location_level_defaults, role_fixtures, location_fixtures);
} else {
    define('bsrs-ember/vendor/people_fixtures', ['exports', 'bsrs-ember/vendor/address_fixtures', 'bsrs-ember/vendor/phone_number_fixtures',
           'bsrs-ember/vendor/defaults/person', 'bsrs-ember/vendor/defaults/role', 'bsrs-ember/vendor/defaults/status', 'bsrs-ember/vendor/defaults/location-level', 'bsrs-ember/vendor/role_fixtures',
            'bsrs-ember/vendor/location_fixtures'],
           function (exports, address_fixtures, phone_number_fixtures, person_defaults, role_defaults, status_defaults, location_level_defaults, role_fixtures, location_fixtures) {
        'use strict';
        return new BSRS_PEOPLE_FACTORY(address_fixtures, phone_number_fixtures, person_defaults, role_defaults, status_defaults, location_level_defaults, role_fixtures, location_fixtures);
    });
}
