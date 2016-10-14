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
    event: {
      associated_model: 'automation-event',
      join_model: 'automation-join-event',
      associated_pointer: 'event'
    },
    action: {
      associated_model: 'automation-action',
      join_model: 'automation-join-action',
      associated_pointer: 'action'
    },
    type: {
      collection: 'actions',
      property: 'automation-action-type',
      related_model: 'type',
    },
    pf: {
      associated_model: 'pfilter',
      join_model: 'automation-join-pfilter'
    },
    //deserializer
    criteria: {
      associated_model: 'criteria',
      join_model: 'pfilter-join-criteria',
    },
    assignee: {
      collection: 'actions',
      property: 'person',
      related_model: 'assignee',
    },
    priority: {
      collection: 'actions',
      property: 'ticket-priority',
      related_model: 'priority',
    },
    status: {
      collection: 'actions',
      property: 'ticket-status',
      related_model: 'status'
    },
    sendemail: {
      collection: 'actions',
      property: 'sendemail',
    },
    sendsms: {
      collection: 'actions',
      property: 'sendsms',
    }
  }
});
