var BSRS_PHONE_NUMBER_FACTORY = (function() {
    var factory = function() {
    };
    factory.prototype.get = function() {
        return [{
            'id':3,
            'number':'858-715-5026',
            'type':{
                'id':1,
                'name':'admin.phonenumbertype.office'
            }
        },
        {
            'id':4,
            'number':'858-715-5056',
            'type':{
                'id':2,
                'name':'admin.phonenumbertype.mobile'
            }
        }];
    };
    factory.prototype.put = function(i) {
        return [
            {id: 3, number: '858-715-5026', type: 2}, {id: 4, number: '858-715-5056', type: 2}
        ];
    };
    return factory;
})();

if (typeof window === 'undefined') {
    module.exports = new BSRS_PHONE_NUMBER_FACTORY();
} else {
    define('bsrs-ember/vendor/phone_number_fixtures', ['exports'], function (exports) {
        'use strict';
        return new BSRS_PHONE_NUMBER_FACTORY();
    });
}
