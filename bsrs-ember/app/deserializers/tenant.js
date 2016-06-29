import Ember from 'ember';

export default Ember.Object.extend({
  deserialize(response, id) {
    let store = this.get('simpleStore');
    let existing_tenant = store.find('tenant', id);
    if (!existing_tenant.get('id') || existing_tenant.get('isNotDirtyOrRelatedNotDirty')) {
      let tenant = store.push('tenant', response);
      tenant.save();
      return tenant;
    }
  }
});