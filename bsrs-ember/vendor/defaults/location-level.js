var BSRS_LOCATION_LEVEL_DEFAULTS_OBJECT = (function() {
    var factory = function() {
    };
    factory.prototype.defaults = function() {
        return {
            id: '132z43cf-9fba-446a-4ec3-29778vu30990',
            idTwo: '232543cf-cfby-129a-3fc9-17771cd70009',
            nameCompany: 'Company',
            nameDistrict: 'District',
            nameStore: 'Store',
            nameRegion: 'Region'
        };
    };
    return factory;
})();

if (typeof window === 'undefined') {
    module.exports = new BSRS_LOCATION_LEVEL_DEFAULTS_OBJECT().defaults();
} else {
    define('bsrs-ember/vendor/defaults/location-level', ['exports'], function (exports) {
        'use strict';
        return new BSRS_LOCATION_LEVEL_DEFAULTS_OBJECT().defaults();
    });
}
