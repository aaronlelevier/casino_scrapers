import Ember from 'ember';

var RoleTypeSelect = Ember.Component.extend({
  simpleStore: Ember.inject.service(),
  options: Ember.computed(function() {
    return this.get('simpleStore').find('role-type'); 
  }),
  selected: Ember.computed('role.role_type', function() {
    const all_role_types = this.get('simpleStore').find('role-type');
    return all_role_types.filter((type) => {
      return type.get('name') === this.get('role').get('role_type');
    }).objectAt(0);
  }),
  actions: {
    selected(role) {
      const model = this.get('role');
      model.set('role_type', role.get('name'));
    },
  }
});

export default RoleTypeSelect;
