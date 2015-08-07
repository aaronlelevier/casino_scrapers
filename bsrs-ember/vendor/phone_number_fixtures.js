var BSRS_PHONE_NUMBER_FACTORY = (function() {
    var factory = function(phone_number_defaults, people_defaults, phone_number_type_defaults) {
        this.first_pk = 3;
        this.second_pk = 4;
        this.first_number = '858-715-5026';
        this.second_number = '858-715-5056';
        this.phone_number_type_defaults = phone_number_type_defaults;
        this.phone_number_defaults = phone_number_defaults;
        this.person = people_defaults; 
    };
    factory.prototype.get = function() {
        return [{
            'id':this.first_pk,
            'number':this.first_number,
            'type': this.phone_number_type_defaults.officeId,
            'person': this.person.id
        },
        {
            'id':this.second_pk,
            'number':this.second_number,
            'type': this.phone_number_type_defaults.mobileId,
            'person': this.person.id
        }];
    };
    factory.prototype.put = function(phone_number) {
        var phone_numbers = [
            {id: this.first_pk, number: this.first_number, type: this.phone_number_type_defaults.officeId, person: this.person.id}, {id: this.second_pk, number: this.second_number, type: this.phone_number_type_defaults.mobileId, person: this.person.id}
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
