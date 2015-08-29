import Ember from 'ember';
import inject from 'bsrs-ember/utilities/store';

export default Ember.Component.extend({
    store: inject('main'),
    actions: {
        changed(person, role_pk) {
            var new_role = this.get('store').find('role', role_pk);
            Ember.run(() => {
                person.change_role(new_role, this.get('model'));
            });
        }
    }
});
