import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import {ValidationMixin, validate} from 'ember-cli-simple-validation/mixins/validate';
import BaseComponent from 'bsrs-ember/components/base-component/component';

var LocationSingle = BaseComponent.extend(ValidationMixin, {
    repository: inject('location'),
    nameValidation: validate('model.name'),
    actions: {
        save() {
            this.set('submitted', true);
            if (this.get('valid')) {
                this._super();
            }
        },
        changedStatus(model, val) {
            Ember.run(() => {
                model.set('status', val);
            });
        }
    }
});

export default LocationSingle;
