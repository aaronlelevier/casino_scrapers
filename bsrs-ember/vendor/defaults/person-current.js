var BSRS_PERSON_CURRENT_DEFAULTS_OBJECT = (function() {
    var factory = function(person_defaults, role_defaults, location_defaults, location_level_defaults, constants) {
        this.person_defaults = person_defaults['default'].defaults();
        this.role_defaults = role_defaults;
        this.location_defaults = location_defaults;
        this.location_level_defaults = location_level_defaults;
        this.constants = constants;
    };
    factory.prototype.defaults = function() {
        var first_name = 'Donald';
        var last_name = 'Trump';
        var permissions = (function() {
            var perms = [];
            this.constants.RESOURCES_WITH_PERMISSION.forEach(function(resource) {
                this.constants.PERMISSION_PREFIXES.forEach(function(prefix) {
                    perms.push(prefix + '_' + resource);
                });
            }.bind(this));
            return perms;
        }.bind(this)());
        return {
            id: 'b783a238-5631-4623-8d24-81a672bb4ea0',
            first_name: first_name,
            last_name: last_name,
            fullname: first_name + ' ' + last_name,
            username: this.person_defaults.nameOne,
            role: this.role_defaults.idOne,
            status_fk: this.person_defaults.status,
            employee_id: '1',
            title: 'Wanker Extrodinare',
            locale: 'a7ae2835-ee7c-4604-92f7-045f3994936e',
            timezone: 'America/Los_Angeles',
            all_locations_and_children: [{
                id: this.location_defaults.idOne,
                name: this.location_defaults.storeName,
                location_level_fk: this.location_level_defaults.idOne
            }],
            permissions: permissions,
            inherited: this.person_defaults.inherited,
            has_multi_locations: true,
            //  this.location_defaults
            locations: [
                {"id": "a7b84195-6086-44b3-9d0c-1e71d69546be", "name": "Andys Pianos", "number": "1", "location_level": "85c18266-dfca-4499-9cff-7c5c6970af7e", "status_fk": "aca00958-987d-4576-aa4c-2093dc7d40f4"}
            ]
        };
    };
    return factory;
})();

if (typeof window === 'undefined') {
    var person_defaults = require('./person');
    var role_defaults = require('./role');
    var location_defaults = require('./location');
    var location_level_defaults = require('./location-level');
    var constants = require('./constants');
    module.exports = new BSRS_PERSON_CURRENT_DEFAULTS_OBJECT(person_defaults, role_defaults, location_defaults, location_level_defaults, constants);
} else {
    define('bsrs-ember/vendor/defaults/person-current', [
        'exports',
        'bsrs-ember/vendor/defaults/person',
        'bsrs-ember/vendor/defaults/role',
        'bsrs-ember/vendor/defaults/location',
        'bsrs-ember/vendor/defaults/location-level',
        'bsrs-ember/utilities/constants'
    ],
    function (exports, person_defaults, role_defaults, location_defaults, location_level_defaults, constants) {
        'use strict';
        let person = new BSRS_PERSON_CURRENT_DEFAULTS_OBJECT(person_defaults, role_defaults, location_defaults, location_level_defaults, constants);
        exports.default = person;
    });
}
