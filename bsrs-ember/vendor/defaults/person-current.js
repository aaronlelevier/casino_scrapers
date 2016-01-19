var BSRS_PERSON_CURRENT_DEFAULTS_OBJECT = (function() {
    var factory = function(person_defaults, role_defaults, location_defaults, location_level_defaults) {
        this.person_defaults = person_defaults;
        this.role_defaults = role_defaults;
        this.location_defaults = location_defaults;
        this.location_level_defaults = location_level_defaults;
    };
    factory.prototype.defaults = function() {
        return {
            id: 'b783a238-5631-4623-8d24-81a672bb4ea0',
            first_name: 'Donald',
            last_name: 'Trump',
            username: this.person_defaults.nameOne,
            role: this.role_defaults.idOne,
            employee_id: '1',
            title: 'Wanker Extrodinare',
            locale: 'a7ae2835-ee7c-4604-92f7-045f3994936e',
            all_locations_and_children: [{
                id: this.location_defaults.idOne,
                name: this.location_defaults.storeName,
                location_level_fk: this.location_level_defaults.idOne
            }]
        };
    };
    return factory;
})();

if (typeof window === 'undefined') {
    var person_defaults = require('./person');
    var role_defaults = require('./role');
    var location_defaults = require('./location');
    var location_level_defaults = require('./location_level');
    module.exports = new BSRS_PERSON_CURRENT_DEFAULTS_OBJECT(person_defaults, role_defaults, location_defaults, location_level_defaults).defaults();
} else {
    define('bsrs-ember/vendor/defaults/person-current', ['exports', 'bsrs-ember/vendor/defaults/person', 'bsrs-ember/vendor/defaults/role', 'bsrs-ember/vendor/defaults/location', 'bsrs-ember/vendor/defaults/location-level'],
    function (exports, person_defaults, role_defaults, location_defaults, location_level_defaults) {
        'use strict';
        return new BSRS_PERSON_CURRENT_DEFAULTS_OBJECT(person_defaults, role_defaults, location_defaults, location_level_defaults).defaults();
    });
}
