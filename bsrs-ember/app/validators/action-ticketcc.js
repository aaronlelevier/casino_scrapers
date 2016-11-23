import BaseValidator from 'ember-cp-validations/validators/base';
import { ACTION_TICKET_CC } from 'bsrs-ember/models/automation-action';

const ActionTicketcc = BaseValidator.extend({
  validate(_value, _options, model, _attribute) {
    if (model.get('type.key') !== ACTION_TICKET_CC) {
      return true;
    } else if (model.get('ticketcc').get('length') > 0 && !!model.get('ticketcc').objectAt(0).get('fullname')) {
      return true;
    } else {
      return 'errors.automation.ticketcc';
    }
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
