var BSRS_LOCATION_LEVEL_DEFAULTS_OBJECT = (function() {
    var factory = function() {
    };
    factory.prototype.defaults = function() {
        return {
            idOne: '232543cf-cfby-129a-3fc9-17771cd70009',
            idTwo: '232543cf-cfby-129a-3fc9-17771cd70010',
            idThree: '232543cf-cfby-129a-3fc9-17771cd70011',
            nameCompany: 'Company',
            nameDistrict: 'District',
            nameStore: 'Store',
            nameRegion: 'Region',
            unusedId: 'cadba3ba-a533-44e0-ab1f-57cc1b052138'
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
