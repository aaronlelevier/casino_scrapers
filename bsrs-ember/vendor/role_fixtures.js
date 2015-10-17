var BSRS_ROLE_FACTORY = (function() {
    var factory = function(role_defaults, category_fixtures, location_level_fixtures) {
        this.role_defaults = role_defaults;
        this.category_fixtures = category_fixtures.default || category_fixtures;
        this.location_level_fixtures = location_level_fixtures.default || location_level_fixtures;
    };
    factory.prototype.generate = function(i) {
        return {
            id: i,
            name: this.role_defaults.nameOne,
            role_type: this.role_defaults.roleTypeGeneral,
            location_level: this.location_level_fixtures.detail().id,
            categories: [this.category_fixtures.detail()]
        }
    };
    factory.prototype.generate_single_for_list = function(i) {
        var id = i || this.role_defaults.idOne;
        var role = this.generate(id);
        delete role.role_type;
        return role;
    };
    factory.prototype.list = function() {
        var response = [];
        var uuid = 'af34ee9b-833c-4f3e-a584-b6851d1e04b';
        response.push({id: uuid + 1, name: this.role_defaults.nameOne, location_level: this.location_level_fixtures.detail().id, role_type: this.role_defaults.roleTypeGeneral });
        response.push({id: uuid + 2, name: this.role_defaults.nameTwo, location_level: this.location_level_fixtures.detail().id, role_type: this.role_defaults.roleTypeGeneral });
        response.push({id: uuid + 3, name: this.role_defaults.nameThree, location_level: this.location_level_fixtures.detail().id, role_type: this.role_defaults.roleTypeGeneral });
        for (var i=4; i <= 10; i++) {
            var rando_uuid = 'af34ee9b-833c-4f3e-a584-b6851d1e04';
            if (i < 10) {
                rando_uuid = rando_uuid + '0' + i;
            } else{
                rando_uuid = rando_uuid + i;
            }
            var role = this.generate(rando_uuid);
            delete role.categories;
            role.name = 'zap' + i;
            response.push(role);
        }
        //we do a reverse order sort here to verify a real sort occurs in the component
        var sorted = response.sort(function(a,b) {
            return b.id - a.id;
        });
        return {'count':19,'next':null,'previous':null,'results': sorted};
        //return {'count':2,'next':null,'previous':null,'results': response};
    };
    factory.prototype.list_two = function() {
        var response = [];
        for (var i=11; i <= 19; i++) {
            var uuid = 'af34ee9b-833c-4f3e-a584-b6851d1e04';
            var role = this.generate(uuid + i);
            delete role.categories;
            role.name = 'xav' + i;
            response.push(role);
        }
        return {'count':19,'next':null,'previous':null,'results': response};
    };
    factory.prototype.detail = function(i) {
        var role = this.generate(i);
        return role;
    };
    factory.prototype.put = function(role) {
        var response = this.generate(role.id);
        response.location_level = this.location_level_fixtures.detail().id;
        response.categories = [response.categories[0].id];
        for (var key in role) {
            response[key] = role[key];
        }
        return response;
    };
    factory.prototype.get = function() {
        return this.role_defaults.idOne;
    };
    return factory;
}());

if (typeof window === 'undefined') {
    var objectAssign = require('object-assign');
    var mixin = require('../vendor/mixin');
    var role_defaults = require('../vendor/defaults/role');
    var category_fixtures = require('../vendor/category_fixtures');
    var location_level_fixtures = require('../vendor/location_level_fixtures');
    objectAssign(BSRS_ROLE_FACTORY.prototype, mixin.prototype);
    module.exports = new BSRS_ROLE_FACTORY(role_defaults, category_fixtures, location_level_fixtures);
} else {
    define('bsrs-ember/vendor/role_fixtures', ['exports','bsrs-ember/vendor/defaults/role', 'bsrs-ember/vendor/category_fixtures', 'bsrs-ember/vendor/location_level_fixtures', 'bsrs-ember/vendor/mixin'], function (exports, role_defaults, category_fixtures, location_level_fixtures, mixin) {
        'use strict';
        Object.assign(BSRS_ROLE_FACTORY.prototype, mixin.prototype);
        var Factory = new BSRS_ROLE_FACTORY(role_defaults, category_fixtures, location_level_fixtures);
        return {default: Factory};
    });
}
