var BSRS_LOCATION_LEVEL_DEFAULTS_OBJECT = (function() {
    var factory = function() {
    };
    factory.prototype.defaults = function() {
        return {
            idOne: '85c18266-dfca-4499-9cff-7c5c6970af7e',
            idTwo: 'b42bd1fc-d959-4896-9b89-aa2b2136ab7f',
            idThree: 'c42bd2fc-d959-4896-9b89-aa2b2136ab9a',
            nameCompany: 'Company',
            nameDistrict: 'District',
            nameDepartment: 'Department',
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
