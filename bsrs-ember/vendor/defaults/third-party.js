var BSRS_THIRD_PARTY_DEFAULTS_OBJECT = (function() {
    var factory = function(third_party_status) {
        this.third_party_status = third_party_status;
    };
    factory.prototype.defaults = function() {
        return {
            idOne: '132z46cf-9fbb-456z-4hc3-59728vu309901',
            idTwo: '132543cf-cfby-129a-3fc9-1t771c372509',
            idThree: '132543cf-cfby-129a-3fc9-1t771c372510',
            baseStoreName: 'ABC123',
            nameOne: 'ABC1231 Contractor',
            nameTwo: 'DEF456 Contractor',
            nameThree: 'GHI789 Contractor',
            nameFour: 'ZXY863 Contractor',
            numberOne: '123zz',
            numberTwo: '456zz',
            nameGridBase: 'vzoname1',
            nameVz: 'vzoname11',
            nameGrid: 'vzoname14',
            nameGrid4: 'ABC1231 Contractor4',
            statusActive: this.third_party_status.active,
            statusActiveName: this.third_party_status.activeName,
            statusInactive: this.third_party_status.inactive,
            unusedId: 'cadba3ba-a533-44e0-ab1f-57cc1b056789',
        };
    };
    return factory;
})();

if (typeof window === 'undefined') {
    var third_party_status = require('./third-party-status');
    module.exports = new BSRS_THIRD_PARTY_DEFAULTS_OBJECT(third_party_status).defaults();
} else {
    define('bsrs-ember/vendor/defaults/third-party', ['exports', 'bsrs-ember/vendor/defaults/third-party-status'], function (exports, third_party_status) {
        'use strict';
        return new BSRS_THIRD_PARTY_DEFAULTS_OBJECT(third_party_status).defaults();
    });
}

