import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import injectStore from 'bsrs-ember/utilities/store';
import {ValidationMixin, validate} from 'ember-cli-simple-validation/mixins/validate';

export default Ember.Component.extend(ValidationMixin, {
    repository: inject('person'),
    location_repo: inject('location'),
    classNames: ['wrapper', 'form'],
    attemptedTransition: '',
    usernameValidation: validate('model.username'),
    locations: Ember.computed('model.role', function() {
        let role = this.get('model.role');
        if(role && role.get('id')) {
            let location_level = role.get('location_level');
            let location_level_pk = location_level.get('id');
            let location_repo = this.get('location_repo');
            return location_repo.find({location_level: location_level_pk});
        }
        return [];
    }),
    actions: {
        savePerson() {
            this.get('model').set('dirtyModel', false);
            this.set('submitted', true);
            if (this.get('valid')) {
                var model = this.get('model');
                var repository = this.get('repository');
                repository.update(model).then(() => {
                    this.sendAction('savePerson');
                });
            }
        },
        cancelPerson() {
            this.sendAction('cancelPerson');
        },
        deletePerson() {
            var model = this.get('model');
            var repository = this.get('repository');
            repository.delete(model.get('id'));
            this.sendAction('redirectUser');
        },
        dirtyModel() {
            this.get('model').set('dirtyModel', true);
        }
    }
});
