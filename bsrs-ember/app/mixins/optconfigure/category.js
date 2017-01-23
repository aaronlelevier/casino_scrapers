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
 *   - associated_pointer defines the lookup_pk on the join model (children_pk)
 */
export default Ember.Mixin.create({
  OPT_CONF: {
    children: {
      associated_model: 'category',
      associated_pointer: 'children',
      join_model: 'category-children'
    },
    parent: {
      collection: 'categories',
      owner: 'category',
      override_property_getter: 'parent'
    },
    sccategory: {
      collection: 'categories',
      owner: 'sccategory'
    }
  },
});

