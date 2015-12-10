var BSRS_ROLE_DEFAULTS_OBJECT = (function() {
    var factory = function(location_level) {
        this.location_level = location_level;
    };
    factory.prototype.defaults = function() {
        return {
            idOne: 'af34ee9b-833c-4f3e-a584-b6851d1e04b1',
            idTwo: 'af34ee9b-833c-4f3e-a584-b6851d1e04b2', 
            idGridTen: 'af34ee9b-833c-4f3e-a584-b6851d1e04017', 
            roleTypeContractor: 'Third Party', 
            roleTypeGeneral: 'Internal',
            nameOne: 'admin.role.system_administrator',
            nameTwo: 'admin.role.district_manager',
            nameContractor: 'admin.role.contractor',
            nameCoordinator: 'admin.role.coordinator',
            nameOneTranslated: 'Administrator',
            nameTwoTranslated: 'District Manager',
            nameThree: 'Manager',
            nameGrid: 'zap4',
            nameGridTen: 'zap10',
            nameGridXav: 'xav14',
            namePut: 'Broom Pusher',
            locationLevelNameOne: this.location_level.nameCompany,
            locationLevelNameTwo: this.location_level.nameRegion,
            locationLevelOne: this.location_level.idOne,
            locationLevelTwo: this.location_level.idTwo,
            categories: [],
            unusedId: 'af34ee9b-833c-4f3e-a584-b6851d1e04b3', 
        };
    };
    return factory;
})();

if (typeof window === 'undefined') {
    var location_level = require('../../vendor/defaults/location-level.js');
    module.exports = new BSRS_ROLE_DEFAULTS_OBJECT(location_level).defaults();
} else {
    define('bsrs-ember/vendor/defaults/role', ['exports', 'bsrs-ember/vendor/defaults/location-level'], function (exports, location_level) {
        'use strict';
        return new BSRS_ROLE_DEFAULTS_OBJECT(location_level).defaults();
    });
}
