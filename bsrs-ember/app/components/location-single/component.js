import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import {ValidationMixin, validate} from 'ember-cli-simple-validation/mixins/validate';

var LocationSingle = Ember.Component.extend(ValidationMixin, {
    repository: inject('location'),
    classNames: ['wrapper', 'form'],
    nameValidation: validate('model.name'),
    actions: {
        saveLocation() {
            this.set('submitted', true);
            if (this.get('valid')) {
                var model = this.get('model');
                var repository = this.get('repository');
                repository.update(model).then(() => {
                    this.sendAction('saveLocation');
                });
            }
        },
        cancelLocation() {
            this.sendAction('redirectUser');
        },
        deleteLocation() {            
            var model = this.get('model');
            var repository = this.get('repository');
            repository.delete(model.get('id'));
            this.sendAction('redirectUser');
        },
        changed(model, val) {
            Ember.run(() => {
                model.set('location_level', val);
            });
        },
    }
});

export default LocationSingle;
