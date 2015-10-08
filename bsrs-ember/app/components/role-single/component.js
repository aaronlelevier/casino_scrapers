import Ember from 'ember';
import {ValidationMixin, validate} from 'ember-cli-simple-validation/mixins/validate';
import BaseComponent from 'bsrs-ember/components/base-component/component';

var RoleSingle = BaseComponent.extend(ValidationMixin, {
    actions: {
        save() {
            this.set('submitted', true);
            if (this.get('valid')) {
                this._super();
            }
        },
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
