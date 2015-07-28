import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import {ValidationMixin, validate} from 'ember-cli-simple-validation/mixins/validate';

export default Ember.Component.extend(ValidationMixin, {
    repository: inject('person'),
    classNames: ['wrapper', 'form'],
    attemptedTransition: '',
    usernameValidation: validate('model.username'),
    actions: {
        savePerson() {
            if (this.get('valid')) {
                var model = this.get('model');
                var repository = this.get('repository');
                repository.update(model).then(() => {
                    this.sendAction('savePerson');
                });
            }
        },
        cancelPerson() {
            var model = this.get('model');
            this.sendAction('cancelPerson');
        },
        deletePerson() {            
            //TODO: Add Delete Person here... FYI - delete will not actually delete.
            var model = this.get('model');
            this.sendAction('cancelPerson', model);
        }
    }
});
