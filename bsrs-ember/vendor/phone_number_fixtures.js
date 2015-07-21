var BSRS_PHONE_NUMBER_FACTORY = (function() {
    var factory = function() {
        this.first_pk = 3;
        this.second_pk = 4;
        this.first_number = '858-715-5026';
        this.second_number = '858-715-5056';
    };
    factory.prototype.get = function() {
        return [{
            'id':this.first_pk,
            'number':this.first_number,
            'type':{
                'id':1,
                'name':'admin.phonenumbertype.office'
            }
        },
        {
            'id':this.second_pk,
            'number':this.second_number,
            'type':{
                'id':2,
                'name':'admin.phonenumbertype.mobile'
            }
        }];
    };
    factory.prototype.put = function(phone_number) {
        var phone_numbers = [
            {id: this.first_pk, number: this.first_number, type: 1}, {id: this.second_pk, number: this.second_number, type: 2}
        ];
        if(!phone_number) {
            return phone_numbers;
        }
        phone_numbers.forEach(function(model) {
            if(model.id === phone_number.id) {
                for (var attr in phone_number) {
                    model[attr] = phone_number[attr];
                }
            }
        });
        return phone_numbers;
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
