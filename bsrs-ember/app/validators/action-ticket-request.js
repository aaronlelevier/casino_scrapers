import BaseValidator from 'ember-cp-validations/validators/base';

const ActionTicketRequest = BaseValidator.extend({
  validate(value, options, model, attribute) {
    return model.get('type.key') !== 'automation.actions.ticket_request' ? true : model.get('request') ? true : 'errors.automation.request';
  }
});

ActionTicketRequest.reopenClass({
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

export default ActionTicketRequest;
