import BaseValidator from 'ember-cp-validations/validators/base';

export default BaseValidator.extend({
  validate(value, options, model, attribute) {
    return model.get('status.name') === 'ticket.status.draft' ? true : model.get(`${attribute}.id`) ? true : 'error.ticket.assignee';
  }
});
