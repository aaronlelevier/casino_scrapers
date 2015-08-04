import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import {ValidationMixin, validate} from 'ember-cli-simple-validation/mixins/validate';

export default Ember.Component.extend(ValidationMixin, {
    repository: inject('location-level'),
    nameValidation: validate('model.name'),
    actions: {
        saveLocationLevel() {
            this.set('submitted', true);
            if (this.get('valid')) {
                var model = this.get('model');
                var repository = this.get('repository');
                repository.insert(model).then(() => {
                    this.sendAction('saveLocationLevel');
                });
            }
        },
        cancelPerson() {
            this.sendAction('redirectUser');
        }
    }
});

