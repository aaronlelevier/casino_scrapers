import Ember from 'ember';
import inject from 'bsrs-ember/utilities/store';

var RoleSelect = Ember.Component.extend({
    store: inject('main'),
    actions: {
        changed(person, role_pk) {
            let new_role = this.get('store').find('role', role_pk);
            Ember.run(() => {
                person.change_role(new_role, this.get('model'));
            });
            // this.set('role_change', person.get('location_level_pk')); 
        }
    }
});

export default RoleSelect;
