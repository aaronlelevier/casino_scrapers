import BaseValidator from 'ember-cp-validations/validators/base';

export var address_name_validation = function(value) {
    let address_pattern = /^[0-9a-z.,@*&#\-\{\}\[\]\(\)\s]+$/i;
    if (!value || value.length < 3) {
        return false;
    }
    return (value.match(address_pattern) !== null);
};

const AddressStreet = BaseValidator.extend({
  validate(value/*, options, model, attribute*/) {
    return address_name_validation(value) ? true : 'errors.address.address';
  }
});

AddressStreet.reopenClass({
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

export default AddressStreet;
