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
      collection: 'automations',
      property: 'person',
      related_model: 'assignee',
    },
    pf: {
      associated_model: 'pfilter',
      join_model: 'automation-join-pfilter',
    },
    //deserializer
    criteria: {
      associated_model: 'criteria',
      join_model: 'pfilter-join-criteria',
    }
  }
});
