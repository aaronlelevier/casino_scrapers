import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import injectStore from 'bsrs-ember/utilities/store';
import {ValidationMixin, validate} from 'ember-cli-simple-validation/mixins/validate';

export default Ember.Component.extend(ValidationMixin, {
    repository: inject('person'),
    store: injectStore('main'),
    usernameValidation: validate('model.username'),
    passwordValidation: validate('model.password'),
    actions: {
        changed(model, val) {
            var role = this.get('store').find('role', val);
            var all_people = role.get('people') || [];
            role.set('people', all_people.concat([this.get('model.id')]));
        },
        savePerson() {
            this.set('submitted', true);
            if (this.get('valid')) {
                var model = this.get('model');
                var repository = this.get('repository');
                repository.insert(model).then(() => {
                    this.sendAction('savePerson');
                });
            }
        },
        cancelPerson() {
            this.sendAction('redirectUser');
        }
    }
});
