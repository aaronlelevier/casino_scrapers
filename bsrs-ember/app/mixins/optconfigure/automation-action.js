import Ember from 'ember';

/**
 * Configuration for bsrs-components add on
 *   - define init function to setup below functions init() { belongs_to.bind(this)('status', 'ticket')}
 *   - * assuming 'status' is passed as first argument
 *   - status (belongs to association to access tickets status)
 *   - change_status
 *   - rollbackStatus
 *   - saveStatus
 *   - statusIsDirty
 *   - statusIsNotDirty
 * Then this file will configure the:
 *   - collection for which the property will find the association
 *   - property that is used as the store model and property on the belongs_to model (ticket)
 *   - related model that overrides the property when doing a this.get('status') method
 */
export default Ember.Mixin.create({
  OPT_CONF: {
    assignee: {
      collection: 'actions',
      owner: 'related-person',
      override_property_getter: 'assignee'
    },
    priority: {
      collection: 'actions',
      owner: 'ticket-priority',
      override_property_getter: 'priority'
    },
    type: {
      collection: 'actions',
      owner: 'automation-action-type',
      override_property_getter: 'type'
    },
    status: {
      collection: 'actions',
      owner: 'ticket-status',
      override_property_getter: 'status'
    },
    sendemail: {
      collection: 'actions',
      owner: 'sendemail',
    },
    sendsms: {
      collection: 'actions',
      owner: 'sendsms'
    },
    ticketcc: {
      associated_model: 'related-person',
      join_model: 'action-join-person'
    },
  }
});
