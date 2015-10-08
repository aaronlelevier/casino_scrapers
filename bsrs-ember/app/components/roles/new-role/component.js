import Ember from 'ember';
import BaseComponent from 'bsrs-ember/components/base-component-new/component';
import {ValidationMixin, validate} from 'ember-cli-simple-validation/mixins/validate';

var RoleNew = BaseComponent.extend(ValidationMixin, {
    nameValidation: validate('model.name'),
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
        save() {
            this.set('submitted', true);
            if (this.get('valid')) {
                this._super();
            }
        }
    }
});

export default RoleNew;
