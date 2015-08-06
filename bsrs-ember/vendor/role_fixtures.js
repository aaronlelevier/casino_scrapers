var BSRS_ROLE_FACTORY = (function() {
    var factory = function(role_defaults, category_fixtures) {
        this.role_defaults = role_defaults;
        this.category_fixtures = category_fixtures;
    };
    factory.prototype.generate = function(i) {
        return {
            id: this.role_defaults.idOne,
            name: this.role_defaults.name,
            role_type: this.role_defaults.roleTypeGeneral,
            location_level: this.role_defaults.locationLevelOne
        }
    };
    factory.prototype.list = function() {
        var response = [];
        for (var i=1; i <= 5; i++) {
            var uuid = '929563yf-6fea-423y-8bc3-19788cd7995';
            response.push(this.generate(uuid + i));
        }
        return {'count':3,'next':null,'previous':null,'results': response};
    };
    factory.prototype.detail = function(i) {
        var role = this.generate(i);
        role.categories = this.category_fixtures.get();
        return role;
    };
    factory.prototype.empty = function() {
        return {'count':3,'next':null,'previous':null,'results': []};
    };
    factory.prototype.put = function(role) {
        var response = this.generate(role.id);
        role.categories = this.category_fixtures.put();
        for (var key in role) {
            response[key] = role[key];
        }
        return response;
    };
    return factory
})();

if (typeof window === 'undefined') {
    var role_defaults = require('../vendor/defaults/role');
    var category_fixtures = require('../vendor/category_fixtures');
    module.exports = new BSRS_ROLE_FACTORY(role_defaults, category_fixtures);
} else {
    define('bsrs-ember/vendor/role_fixtures', ['exports','bsrs-ember/vendor/defaults/role', 'bsrs-ember/vendor/category_fixtures'], function (exports, role_defaults, category_fixtures) {
        'use strict';
        return new BSRS_ROLE_FACTORY(role_defaults, category_fixtures);
    });
}
