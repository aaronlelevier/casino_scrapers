import BaseValidator from 'ember-cp-validations/validators/base';
import { ACTION_ASSIGNEE } from 'bsrs-ember/models/automation-action';

const ActionAssignee = BaseValidator.extend({
  validate(_value, _options, model, _attribute) {
    return model.get('type.key') !== ACTION_ASSIGNEE ? true : model.get('assignee.fullname') ? true : 'errors.automation.assignee';
  }
});

ActionAssignee.reopenClass({
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

export default ActionAssignee;
