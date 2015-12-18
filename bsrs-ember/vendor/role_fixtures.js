var BSRS_ROLE_FACTORY = (function() {
    var factory = function(role_defaults, category_fixtures, location_level_fixtures, config) {
        this.role_defaults = role_defaults;
        this.category_fixtures = category_fixtures.default || category_fixtures;
        this.location_level_fixtures = location_level_fixtures.default || location_level_fixtures;
        this.config = config;
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
        var page_size = this.config.default ? this.config.default.APP.PAGE_SIZE : 10;
        for (var i=4; i <= page_size; i++) {
            var rando_uuid = 'af34ee9b-833c-4f3e-a584-b6851d1e04';
            if (i < page_size) {
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
        return {'count':page_size*2-1,'next':null,'previous':null,'results': sorted};
        //return {'count':2,'next':null,'previous':null,'results': response};
    };
    factory.prototype.list_two = function() {
        var response = [];
        var page_size = this.config.default ? this.config.default.APP.PAGE_SIZE : 10;
        for (var i=page_size+1; i <= page_size*2-1; i++) {
            var uuid = 'af34ee9b-833c-4f3e-a584-b6851d1e04';
            var role = this.generate(uuid + i);
            delete role.categories;
            role.name = 'xav' + i;
            response.push(role);
        }
        return {'count':page_size*2-1,'next':null,'previous':null,'results': response};
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
    var config = require('../config/environment');
    objectAssign(BSRS_ROLE_FACTORY.prototype, mixin.prototype);
    module.exports = new BSRS_ROLE_FACTORY(role_defaults, category_fixtures, location_level_fixtures, config);
} else {
    define('bsrs-ember/vendor/role_fixtures', ['exports','bsrs-ember/vendor/defaults/role', 'bsrs-ember/vendor/category_fixtures', 'bsrs-ember/vendor/location_level_fixtures', 'bsrs-ember/vendor/mixin', 'bsrs-ember/config/environment'], function (exports, role_defaults, category_fixtures, location_level_fixtures, mixin, config) {
        'use strict';
        Object.assign(BSRS_ROLE_FACTORY.prototype, mixin.prototype);
        var Factory = new BSRS_ROLE_FACTORY(role_defaults, category_fixtures, location_level_fixtures, config);
        return {default: Factory};
    });
}
