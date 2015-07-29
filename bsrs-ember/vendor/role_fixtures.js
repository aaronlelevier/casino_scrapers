var BSRS_ROLE_FACTORY = (function() {
    var factory = function(role_defaults) {
        this.role_defaults = role_defaults;
    }
    factory.prototype.generate = function() {
        return {
            "id": this.role_defaults.id,
            "name": this.role_defaults.name
        };
    };
    factory.prototype.list = function() {
        var response = [];
        for (var i=1; i <= 5; i++) {
            response.push(this.generate());
        }
        return {'count':3,'next':null,'previous':null,'results': response};
    };
    factory.prototype.detail = function() {
        return this.generate();
    };
    factory.prototype.put = function(role) {
        var response = this.generate();
        for (var key in role) {
            response[key] = role[key];
        }
        return response;
    };
    return factory
})();

if (typeof window === 'undefined') {
    var role_defaults = require('../vendor/defaults/role');
    module.exports = new BSRS_ROLE_FACTORY(role_defaults);
} else {
    define('bsrs-ember/vendor/role_fixtures', ['exports', 'bsrs-ember/vendor/defaults/role'], function (exports, role_defaults) {
        'use strict';
        return new BSRS_ROLE_FACTORY(role_defaults);
    });
}
