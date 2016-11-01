import BaseValidator from 'ember-cp-validations/validators/base';

const AutomationActionType = BaseValidator.extend({
  validate(value, options, model, attribute) {
    let type = model.get('type');
    if (type) {
      switch (type.get('key')) {
        case 'automation.actions.ticket_assignee':
          if (!model.get('assignee')) {
            return 'errors.automation.type.assignee';
          }
        break;
        case 'automation.actions.ticket_priority':
          if (!model.get('priority')) {
            return 'errors.automation.type.priority';
          }
        break;
      }
    }
    return true;
  }
});

AutomationActionType.reopenClass({
  getDependentsFor(attribute, options) {
    return ['model.assignee', 'model.priority'];
  }
});

export default AutomationActionType;