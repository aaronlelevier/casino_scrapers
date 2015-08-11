import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import {ValidationMixin, validate} from 'ember-cli-simple-validation/mixins/validate';

var LocationsNewComponent = Ember.Component.extend(ValidationMixin, {
    repository: inject('location'),
    nameValidation: validate('model.name'),
    numberValidation: validate('model.number'),
    actions: {
        saveLocation() {
            this.set('submitted', true);
            if (this.get('valid')) {
                var model = this.get('model');
                var repository = this.get('repository');
                repository.insert(model).then(() => {
                    this.sendAction('saveLocation');
                });
            }
        },
        cancelLocation() {
            this.sendAction('redirectUser');
        },
        changed(model, val) {
            Ember.run(() => {
                model.set('location_level', val);
            });
        }
    }
});

export default LocationsNewComponent;
