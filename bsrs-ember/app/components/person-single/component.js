import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import injectStore from 'bsrs-ember/utilities/store';
import {ValidationMixin, validate} from 'ember-cli-simple-validation/mixins/validate';

export default Ember.Component.extend(ValidationMixin, {
    repository: inject('person'),
    store: injectStore('main'),
    classNames: ['wrapper', 'form'],
    attemptedTransition: '',
    usernameValidation: validate('model.username'),
    actions: {
        changed(model, val) {
            var person_id = this.get('model.id');
            var new_role = this.get('store').find('role', val);
            var old_role = this.get('model').get('role');

            var new_role_people = new_role.get('people') || [];
            var old_role_people = old_role.get('people') || [];

            Ember.run(function() {
                new_role.set('people', new_role_people.concat([person_id]));
                old_role.set('people', old_role_people.filter((old_role_person_pk) => {
                    return old_role_person_pk !== person_id;
                }));
            });
        },
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
