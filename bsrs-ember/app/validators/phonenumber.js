/* NOT USED USE CP-VALIDATION PHONE FORMAT */



import BaseValidator from 'ember-cp-validations/validators/base';

let START = '^';
let END = '$';
let WS = '\\s*';
let SEP = '[.\\- /]*';
let OPTIONAL_COUNTRY_CODE = '((?:\\+|00)?[1-9]\\d*)?';
let AREA_CODE = '(\\(\\d{3}\\)|\\d{3})';
let PREFIX = '(\\d{3})';
let LINE_NUMBER = '(\\d{4})';
let PHONE_REGEX = new RegExp(START + WS + OPTIONAL_COUNTRY_CODE + SEP + AREA_CODE + SEP + PREFIX + SEP + LINE_NUMBER + WS + END);

var stripNonNumeric = function (str) {
    return str.replace(/[^0-9]+/, '');
};

export var phoneIsAllowedRegion = function(phone) {
    var match = PHONE_REGEX.exec(phone);

    if (!match) {
        return true; // Can't determine region; format validation will have to take care of this
    }

    var countryCode = match[1];
    countryCode = countryCode ? parseInt(countryCode) : 1;

    if (countryCode !== 1) {
        return false;
    }

    var areaCode = parseInt(stripNonNumeric(match[2]));
    if (!areaCode || areaCode.toString().length !== 3) {
        return false;
    }

    return true;
};

export var phoneIsValidFormat = function(phone) {
    var match = PHONE_REGEX.exec(phone);

    if (!match) {
        return false;
    }

    return true;
};

const Phonenumber = BaseValidator.extend({
  /* @method validate - phonenumbers
   * @param {string} attribute - field on ticket model
   * want to prevent user from saving a ticket if the status is draft or new, let them save the form
  */
  validate(value, options, model) {
    return true;
    // return value.reduce((prev, phonenumber) => {
    //   return !phoneIsAllowedRegion(phonenumber.get('number')) ? 'admin.person.label.phone_number_region' : !phoneIsValidFormat(phonenumber.get('number')) ? 'admin.person.label.phone_number.one' : prev ? prev : true;
    // }, true);
  }
});

Phonenumber.reopenClass({
  /**
   * Define attribute specific dependent keys for your validator
   *
   * [
   * 	`model.array.@each.${attribute}` --> Dependent is created on the model's context
   * 	`${attribute}.isValid` --> Dependent is created on the `model.validations.attrs` context
   * ]
   *
   * @param {String}  attribute   The attribute being evaluated
   * @param {Unknown} options     Options passed into your validator
   * @return {Array}
   */
  getDependentsFor(/* attribute, options */) {
    return [];
  }
});

export default Phonenumber;
