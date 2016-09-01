import BaseValidator from 'ember-cp-validations/validators/base';

export default BaseValidator.extend({
  /* @method validate
   * @param {string} attribute - field on ticket model
   * want to prevent user from saving a ticket if the status is draft or new, let them save the form
  */
  validate(value, options, model, attribute) {
    return (model.get('status.name') === 'ticket.status.draft' || model.get('status.name') === 'ticket.status.new') ? true : model.get(`${attribute}.id`) ? true : 'errors.ticket.assignee';
  }
});
