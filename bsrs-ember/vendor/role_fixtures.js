var BSRS_ROLE_FACTORY = (function() {
    var generateRecord = function() {
        return {
            "id": 3,
            "name": "System Administrator"
        };
    };
    var factory = function() {
    }
    factory.prototype.list = function() {
        var response = [];
        for (var i=1; i <= 5; i++) {
            response.push(generateRecord());
        }
        return {'count':3,'next':null,'previous':null,'results': response};
    };
    factory.prototype.detail = function() {
        return generateRecord();
    };
    factory.prototype.put = function(role) {
        var response = generateRecord();
        for (var key in role) {
            response[key] = role[key];
        }
        return response;
    };
    return factory
})();

if (typeof window === 'undefined') {
    module.exports = new BSRS_ROLE_FACTORY();
    ;
} else {
    define('bsrs-ember/vendor/role_fixtures', ['exports'], function (exports) {
        'use strict';
        return new BSRS_ROLE_FACTORY();
    });
}
