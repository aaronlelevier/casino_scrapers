import BaseValidator from 'ember-cp-validations/validators/base';

const CategoryCostAmount = BaseValidator.extend({
  validate(value, _options, model) {
    if(!model.get('parent') && !value) {
      return 'errors.category.cost_amount';
    }
    return true;
  }
});

CategoryCostAmount.reopenClass({
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

export default CategoryCostAmount;
