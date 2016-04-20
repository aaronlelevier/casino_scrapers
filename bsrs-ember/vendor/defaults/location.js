var BSRS_LOCATION_DEFAULTS_OBJECT = (function() {
    var factory = function(location_status, location_level, location_level_fixtures) {
        this.location_status = location_status;
        this.location_level = location_level;
        this.location_level_fixtures = location_level_fixtures.default || location_level_fixtures;
    };
    factory.prototype.defaults = function() {
        return {
            idZero: 'a7b84195-6086-44b3-9d0c-1e71d69546be',
            idOne: '232z46cf-9fbb-456z-4hc3-59728vu309901',
            idTwo: '232543cf-cfby-129a-3fc9-1t771c372509',
            idThree: '232543cf-cfby-129a-3fc9-1t771c372510',
            idFour: '232543cf-cfby-129a-3fc9-1t771c372511',
            idParent: '232543cf-cfby-129a-3fc9-1t771c372622',
            idParentTwo: '232543cf-cfby-129a-3fc9-1t771c372623',
            baseStoreName: 'ABC123',
            storeName: 'Company',
            storeNameOne: 'ABC1231',
            storeNameOneLast: 'ABC12310',
            storeNameTwo: 'DEF456',
            storeNameThree: 'GHI789',
            storeNameFour: 'ZXY863',
            storeNameFive: 'ABC1234',
            storeNameParent: 'Parent Location',
            storeNameParentTwo: 'Parent Two Location',
            storeNumber: '123zz',
            storeNumberTwo: '456zz',
            storeVz: 'vzoname11',
            status: this.location_status.openId,
            location_level: this.location_level_fixtures.detail(),
            unusedId: 'cadba3ba-a533-44e0-ab1f-57cc1b056789',
            anotherId: 'zcreb4ba-a533-44e0-ab1f-57cc1b056789',
            gridTwoId: '232z46cf-9fbb-456z-4hc3-59728vu309902',
            gridLocSelect: '232z46cf-9fbb-456z-4hc3-59728vu309904',
            apple: 'apple',
            boondocks: 'Boondocks',
        };
    };
    return factory;
})();

if (typeof window === 'undefined') {
    var location_level = require('./location-level');
    var location_status = require('./location-status');
    var location_level_fixtures = require('../location_level_fixtures');
    module.exports = new BSRS_LOCATION_DEFAULTS_OBJECT(location_status, location_level, location_level_fixtures).defaults();
} else {
    define('bsrs-ember/vendor/defaults/location', ['exports', 'bsrs-ember/vendor/defaults/location-status', 'bsrs-ember/vendor/defaults/location-level', 'bsrs-ember/vendor/location_level_fixtures'], function (exports, location_status, location_level, location_level_fixtures) {
        'use strict';
        return new BSRS_LOCATION_DEFAULTS_OBJECT(location_status, location_level, location_level_fixtures).defaults();
    });
}
