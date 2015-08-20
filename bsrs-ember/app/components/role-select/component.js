import Ember from 'ember';
import inject from 'bsrs-ember/utilities/store';

export default Ember.Component.extend({
    store: inject('main'),
    actions: {
        changed(model, val) {
            var person_id = model.get('id');
            var new_role = this.get('store').find('role', val);
            var old_role = this.get('model');

            var new_role_people = new_role.get('people') || [];

            Ember.run(() => {
                if(new_role.get('content')) {
                    new_role.set('people', new_role_people.concat([person_id]));
                }
                if(old_role) {
                    var old_role_people = old_role.get('people') || [];
                    old_role.set('people', old_role_people.filter((old_role_person_pk) => {
                        return old_role_person_pk !== person_id;
                    }));
                    old_role.save();
                }
            });
        }
    }
});
