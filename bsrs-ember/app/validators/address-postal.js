import BaseValidator from 'ember-cp-validations/validators/base';

export const postal_code_validation = function(value='') {
    const postal_code_pattern = /^[a-z0-9\-\s]+$/i;
    if (value.length < 5) {
        return false;
    }
    return (value.match(postal_code_pattern) !== null);
};

const AddressPostal = BaseValidator.extend({
  validate(value/*, options, model, attribute*/) {
    return postal_code_validation(value) ? true : 'errors.address.postal_code';
  }
});

AddressPostal.reopenClass({
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

export default AddressPostal;
