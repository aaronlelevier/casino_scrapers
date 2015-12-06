import Ember from 'ember';

var RoleSelect = Ember.Component.extend({
    selected: Ember.computed('model.role', function() {
        return this.get('model').get('role');
    }),
    actions: {
        selected(role) {
            const person = this.get('model');
            person.change_role(role);
            this.set('role_change', role.get('id'));
        }
    }
});

export default RoleSelect;
