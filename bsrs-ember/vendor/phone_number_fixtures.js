var BSRS_PHONE_NUMBER_FACTORY = (function() {
  var factory = function(phone_number, people, phonenumber_type) {
    this.phonenumber_type = phonenumber_type;
    this.phone_number = phone_number;
    this.person = people['default'].defaults();
  };
  factory.prototype.get = function() {
    return [{
      id: this.phone_number.idOne,
      number: this.phone_number.numberOne,
      type: this.phonenumber_type.idOne,
    }, {
      id: this.phone_number.idTwo,
      number: this.phone_number.numberTwo,
      type: this.phonenumber_type.idTwo,
    }];
  };
  factory.prototype.get_belongs_to = function() {
    return {
      id: this.phone_number.idOne,
      number: this.phone_number.numberOne,
      type: this.phonenumber_type.officeId,
    }
  };
  factory.prototype.get_with_related_ids = function() {
    return [{
      id: this.phone_number.idOne,
      number: this.phone_number.numberOne,
      type: this.phonenumber_type.idOne
    }, {
      id: this.phone_number.idTwo,
      number: this.phone_number.numberTwo,
      type: this.phonenumber_type.idTwo
    }];
  };
  factory.prototype.put = function(phone_number) {
    var phone_numbers = this.get_with_related_ids();
    if (!phone_number) {
      return phone_numbers;
    }
    phone_numbers.forEach(function(model) {
      if (model.id === phone_number.id) {
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
  var phone_number = require('./defaults/phone-number');
  var people = require('./defaults/person');
  var phonenumber_type = require('./defaults/phone-number-type');
  module.exports = new BSRS_PHONE_NUMBER_FACTORY(phone_number, people, phonenumber_type);
}
else {
  define('bsrs-ember/vendor/phone_number_fixtures', ['exports', 'bsrs-ember/vendor/defaults/phone-number', 'bsrs-ember/vendor/defaults/person', 'bsrs-ember/vendor/defaults/phone-number-type'],
    function(exports, phone_number, people, phonenumber_type) {
      'use strict';
      return new BSRS_PHONE_NUMBER_FACTORY(phone_number, people, phonenumber_type);
    });
}
