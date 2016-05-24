import Ember from 'ember';
import RoleSingleComponent from 'bsrs-ember/components/roles/role-single/component';

var RoleSingle = RoleSingleComponent.extend({
    simpleStore: Ember.inject.service(),
    actions: {
        changeBool(key) {
            const store = this.get('simpleStore');
            let setting = store.find('role', this.get('model.id'));
            setting.toggleProperty(key);
        }
    }
    
});

export default RoleSingle;