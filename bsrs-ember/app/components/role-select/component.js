import Ember from 'ember';

var RoleSelect = Ember.Component.extend({
  actions: {
    /*
    * @method selected
    * role_change is a query param in person controller
    */
    selected(role) {
      const person = this.get('model');
      person.change_role(role);
      this.set('role_change', role.get('id'));
    }
  }
});

export default RoleSelect;
