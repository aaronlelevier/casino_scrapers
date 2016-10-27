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
 *   - main_model used for m2m in order to override a generic model definition in the init method with the parent model (ticket instead of generic for attachments)
 */
export default Ember.Mixin.create({
  OPT_CONF: {
    status: {
      collection: 'tickets',
      property: 'ticket-status',
      related_model: 'status',
    },
    priority: {
      collection: 'tickets',
      property: 'ticket-priority',
      related_model: 'priority',
    },
    assignee: {
      collection: 'assigned_tickets',
      property: 'person',
      related_model: 'assignee',
    },
    location: {
      collection: 'tickets',
      property: 'location',
    },
    cc: {
      associated_model: 'person',
      join_model: 'ticket-join-person'
    },
    attachments: {
      associated_model: 'attachment',
      join_model: 'generic-join-attachment',
      main_model: 'ticket'
    },
    categories: {
      associated_model: 'category',
      join_model: 'model-category',
      main_model: 'ticket'
    }
  },
});
