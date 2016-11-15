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
    status: {
      collection: 'links',
      property: 'ticket-status',
      override_property_getter: 'status',
    },
    priority: {
      collection: 'links',
      property: 'ticket-priority',
      override_property_getter: 'priority',
    },
    destination: {
      collection: 'destination_links',
      property: 'dtd',
      override_property_getter: 'destination',
    },
    categories: {
      associated_model: 'category',
      join_model: 'model-category',
      main_model: 'link'
    }
  },
});

