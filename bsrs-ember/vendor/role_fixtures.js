var BSRS_ROLE_FACTORY = (function() {
    var factory = function(role_defaults, category_fixtures, location_level_fixtures) {
        this.role_defaults = role_defaults;
        this.category_fixtures = category_fixtures;
        this.location_level_fixtures = location_level_fixtures;
    };
    factory.prototype.generate = function(i) {
        return {
            id: i,
            name: this.role_defaults.nameOne,
            role_type: this.role_defaults.roleTypeGeneral,
            location_level: this.location_level_fixtures.detail().id
        }
    };
    factory.prototype.generate_single_for_list = function(i) {
        var role = this.generate(i);
        delete role.location_level;
        delete role.role_type;
        return role;
    };
    factory.prototype.list = function() {
        var response = [];
        var uuid = 'af34ee9b-833c-4f3e-a584-b6851d1e04b';
        response.push({id: uuid + 1, name: this.role_defaults.nameOne});
        response.push({id: uuid + 2, name: this.role_defaults.nameTwo});
        return {'count':2,'next':null,'previous':null,'results': response};
    };
    factory.prototype.detail = function(i) {
        var role = this.generate(i);
        return role;
    };
    factory.prototype.empty = function() {
        return {'count':0,'next':null,'previous':null,'results': []};
    };
    factory.prototype.put = function(role) {
        var response = this.generate(role.id);
        response.location_level = response.location_level.id;
        for (var key in role) {
            response[key] = role[key];
        }
        return response;
    };
    factory.prototype.get = function() {
        return {
            'id': this.role_defaults.idOne,
            'name': this.role_defaults.nameOne,
            'location_level': this.location_level_fixtures.detail().id,
            'role_type': this.role_defaults.roleTypeGeneral
        }
    };
    return factory;
})();

if (typeof window === 'undefined') {
    var role_defaults = require('../vendor/defaults/role');
    var category_fixtures = require('../vendor/category_fixtures');
    var location_level_fixtures = require('../vendor/location_level_fixtures');
    module.exports = new BSRS_ROLE_FACTORY(role_defaults, category_fixtures, location_level_fixtures);
} else {
    define('bsrs-ember/vendor/role_fixtures', ['exports','bsrs-ember/vendor/defaults/role', 'bsrs-ember/vendor/category_fixtures', 'bsrs-ember/vendor/location_level_fixtures'], function (exports, role_defaults, category_fixtures, location_level_fixtures) {
        'use strict';
        return new BSRS_ROLE_FACTORY(role_defaults, category_fixtures, location_level_fixtures);
    });
}
