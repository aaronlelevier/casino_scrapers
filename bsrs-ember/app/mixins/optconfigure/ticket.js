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
 *   - collection for which the property will find the association, i.e. location model will store an array of ticket []
 *   - property that is used as the store model and property on the belongs_to model (ticket)
 *   - override_property_getter - that overrides the property when doing a this.get('status') method
 *   - main_model used for m2m in order to override a generic model definition in the init method with the parent model (ticket instead of generic for attachments)
 */
export default Ember.Mixin.create({
  OPT_CONF: {
    status: {
      collection: 'tickets',
      owner: 'ticket-status',
      override_property_getter: 'status',
    },
    priority: {
      collection: 'tickets',
      owner: 'ticket-priority',
      override_property_getter: 'priority',
    },
    assignee: {
      collection: 'assigned_tickets',
      owner: 'related-person',
      override_property_getter: 'assignee',
    },
    location: {
      collection: 'tickets',
      owner: 'related-location',
      override_property_getter: 'location',
    },
    cc: {
      associated_model: 'related-person',
      join_model: 'ticket-join-person'
    },
    wo: {
      associated_model: 'work-order',
      join_model: 'ticket-join-wo'
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
    },

    // deserializer
    photo: {
      collection: 'people',
      owner: 'attachment',
      override_property_getter: 'photo',
    },
  },
});
