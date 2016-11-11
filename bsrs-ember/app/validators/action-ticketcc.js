import BaseValidator from 'ember-cp-validations/validators/base';

const ActionTicketcc = BaseValidator.extend({
  validate(_value, _options, model, _attribute) {
    return model.get('type.key') !== 'automation.actions.ticket_cc' ? true : model.get('ticketcc').get('length') > 0 ? true : 'errors.automation.ticketcc';
  }
});

ActionTicketcc.reopenClass({
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

export default ActionTicketcc;
