import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import BaseComponent from 'bsrs-ember/components/base-component/component';

var RoleSingle = BaseComponent.extend({
    repository: inject('role'),
    actions: {
        changed(model, val) {
            Ember.run(() => {
                model.set('role_type', val);
            });
        },
        changedLocLevel(model, val) {
            Ember.run(() => {
                model.set('location_level', val);
            });
        },
    }
});

export default RoleSingle;
