var BSRS_PHONE_NUMBER_FACTORY = (function() {
    var factory = function(phone_number_defaults, people_defaults, phone_number_type_defaults) {
        this.phone_number_type_defaults = phone_number_type_defaults;
        this.phone_number_defaults = phone_number_defaults;
        this.person = people_defaults; 
    };
    factory.prototype.get = function() {
        return [{
            'id':this.phone_number_defaults.idOne,
            'number':this.phone_number_defaults.numberOne,
            'type': this.phone_number_type_defaults.officeId,
        },
        {
            'id':this.phone_number_defaults.idTwo,
            'number':this.phone_number_defaults.numberTwo,
            'type': this.phone_number_type_defaults.mobileId,
        }];
    };
    factory.prototype.put = function(phone_number) {
        var phone_numbers = this.get();
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
    var phone_number_defaults = require('./defaults/phone-number');
    var people_defaults = require('./defaults/person');
    var phone_number_type_defaults = require('./defaults/phone-number-type');
    module.exports = new BSRS_PHONE_NUMBER_FACTORY(phone_number_defaults, people_defaults, phone_number_type_defaults);
} else {
    define('bsrs-ember/vendor/phone_number_fixtures', ['exports', 'bsrs-ember/vendor/defaults/phone-number', 'bsrs-ember/vendor/defaults/person', 'bsrs-ember/vendor/defaults/phone-number-type'], function (exports, phone_number_defaults, people_defaults, phone_number_type_defaults) {
        'use strict';
        return new BSRS_PHONE_NUMBER_FACTORY(phone_number_defaults, people_defaults, phone_number_type_defaults);
    });
}
