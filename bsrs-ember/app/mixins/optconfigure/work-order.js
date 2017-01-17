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
    cost_estimate_currency: {
      collection: 'workOrders',
      owner: 'currency',
      override_property_getter: 'cost_estimate_currency',
    },
    status: {
      collection: 'workOrders',
      owner: 'work-order-status',
      override_property_getter: 'status',
    },
    category: {
      collection: 'workOrders',
      owner: 'category'
    },
    provider: {
      collection: 'workOrders',
      owner: 'provider'
    },
    approver: {
      collection: 'workOrders',
      owner: 'person',
      override_property_getter: 'approver',
    }
  }
});
