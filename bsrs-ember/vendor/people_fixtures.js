var BSRS_PEOPLE_FACTORY = (function() {
    var factory = function(email_fixtures, address_fixtures, phone_number_fixtures, person_defaults, role_defaults, status_defaults, location_level_defaults, role_fixtures, location_fixtures, location_defaults, config) {
        this.emails = email_fixtures;
        this.address_fixtures = address_fixtures;
        this.person_defaults = person_defaults;
        this.phone_number_fixtures = phone_number_fixtures;
        this.role_fixtures = role_fixtures.default || role_fixtures;
        this.location_fixtures = location_fixtures.default || location_fixtures;
        this.role_defaults = role_defaults;
        this.status_defaults = status_defaults;
        this.location_level_defaults = location_level_defaults;
        this.location_defaults = location_defaults;
        this.config = config;
    };
    factory.prototype.get = function(i, first_name, last_name) {
        //right now function used for tickets
        return {
            id: i || this.person_defaults.id,
            first_name: first_name || this.person_defaults.first_name,
            last_name: last_name || this.person_defaults.last_name,
            email: this.person_defaults.emails,
            role: this.person_defaults.role,
            status: this.person_defaults.status
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
            employee_id : this.person_defaults.employee_id,
            auth_amount : this.person_defaults.auth_amount,
            status : this.status_defaults.activeId,
            role: this.role_fixtures.get(),
            locations: [],
            emails: [],
            phone_numbers: [],
            phone_numbers: [],
            addresses: []
        }
    },
    factory.prototype.generate_single_for_list = function(i) {
        var person = this.generate(i);
        delete person.locations;
        delete person.emails;
        delete person.phone_numbers;
        delete person.addresses;
        // delete person.role.location_level;
        // delete person.role.role_type;
        return person;
    },
    factory.prototype.list = function() {
        var response = [];
        var page_size = this.config.default ? this.config.default.APP.PAGE_SIZE : 10;
        for (var i=1; i <= page_size; i++) {
            var uuid = '139543cf-8fea-426a-8bc3-09778cd799';
            if (i < 25) {
                uuid = uuid + '0' + i;
            } else{
                uuid = uuid + i;
            }
            var person = this.generate(uuid);
            delete person.locations;
            delete person.emails;
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
        return {'count':page_size*2-2,'next':null,'previous':null,'results': sorted};
    };
    factory.prototype.list_two = function() {
        var response = [];
        var page_size = this.config.default ? this.config.default.APP.PAGE_SIZE : 10;
        for (var i=page_size+1; i <= page_size*2-2; i++) {
            var uuid = '139543cf-8fea-426a-8bc3-09778cd799';
            var person = this.generate(uuid + i);
            person.role = this.role_defaults.idTwo;
            delete person.locations;
            delete person.emails;
            delete person.phone_numbers;
            delete person.addresses;
            person.username = 'scott' + i;
            person.first_name = 'Scott' + i;
            person.last_name = 'Newcomer' + i;
            person.title = i + ' WAT';
            response.push(person);
        }
        return {'count':page_size*2-2,'next':null,'previous':null,'results': response};
    };
    factory.prototype.detail = function(i, username) {
        var j = i || this.person_defaults.idOne;
        var person = this.generate(j);
        var current_username = person.username;
        person.username = username || current_username;
        person.acceptassign = false;
        person.emails = this.emails.get();
        person.phone_numbers = this.phone_number_fixtures.get();
        person.addresses = this.address_fixtures.get();
        person.locale = this.person_defaults.locale_id;
        person.locations = [this.location_fixtures.get()];
        return person;
    };
    factory.prototype.put = function(person) {
        var response = this.generate(person.id);
        response.emails = this.emails.put();
        response.phone_numbers = this.phone_number_fixtures.put();
        response.addresses = this.address_fixtures.put();
        response.status = this.status_defaults.activeId;
        response.role = this.role_defaults.idOne;
        response.locale = this.person_defaults.locale_id;
        response.locations = [this.location_defaults.idOne];
        for(var key in person) {
            response[key] = person[key];
        }
        return response;
    };
    factory.prototype.search = function() {
        var response = [];
        for (var i=1; i <= 10; i++) {
            var uuid = '249543cf-8fea-426a-8bc3-09778cd780';
            if (i < 10) {
                uuid = uuid + '0' + i;
            } else{
                uuid = uuid + i;
            }
            var person = this.generate(uuid);
            delete person.locations;
            delete person.phone_numbers;
            delete person.addresses;
            person.username = 'boy' + i;
            person.first_name = 'Boy' + i;
            person.last_name = 'Man' + i;
            person.title = i + ' Mob Boss';
            response.push(person);
        }
        //we do a reverse order sort here to verify a real sort occurs in the component
        var sorted = response.sort(function(a,b) {
            return b.id - a.id;
        });
        return {'count':10,'next':null,'previous':null,'results': sorted};
    };

    return factory;
})();

if (typeof window === 'undefined') {
    var objectAssign = require('object-assign');
    var mixin = require('../vendor/mixin');
    var email_fixtures = require('../vendor/email_fixtures');
    var address_fixtures = require('../vendor/address_fixtures');
    var phone_number_fixtures = require('../vendor/phone_number_fixtures');
    var role_fixtures = require('../vendor/role_fixtures');
    var person_defaults = require('../vendor/defaults/person');
    var role_defaults = require('../vendor/defaults/role');
    var status_defaults = require('../vendor/defaults/status');
    var location_level_defaults = require('../vendor/defaults/location-level');
    var location_defaults = require('../vendor/defaults/location');
    var location_fixtures = require('../vendor/location_fixtures');
    var config = require('../config/environment');
    objectAssign(BSRS_PEOPLE_FACTORY.prototype, mixin.prototype);
    module.exports = new BSRS_PEOPLE_FACTORY(email_fixtures, address_fixtures, phone_number_fixtures, person_defaults, role_defaults, status_defaults, location_level_defaults, role_fixtures, location_fixtures, location_defaults, config);
} else {
    define('bsrs-ember/vendor/people_fixtures', ['exports', 'bsrs-ember/vendor/email_fixtures', 'bsrs-ember/vendor/address_fixtures', 'bsrs-ember/vendor/phone_number_fixtures',
           'bsrs-ember/vendor/defaults/person', 'bsrs-ember/vendor/defaults/role', 'bsrs-ember/vendor/defaults/status', 'bsrs-ember/vendor/defaults/location-level', 'bsrs-ember/vendor/role_fixtures',
            'bsrs-ember/vendor/location_fixtures', 'bsrs-ember/vendor/defaults/location', 'bsrs-ember/vendor/mixin', 'bsrs-ember/config/environment'],
           function (exports, email_fixtures, address_fixtures, phone_number_fixtures, person_defaults, role_defaults, status_defaults, location_level_defaults, role_fixtures, location_fixtures, location_defaults, mixin, config) {
        'use strict';
        Object.assign(BSRS_PEOPLE_FACTORY.prototype, mixin.prototype);
        var Factory = new BSRS_PEOPLE_FACTORY(email_fixtures, address_fixtures, phone_number_fixtures, person_defaults, role_defaults, status_defaults, location_level_defaults, role_fixtures, location_fixtures, location_defaults, config);
        return {default: Factory};
    });
}
