import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import injectStore from 'bsrs-ember/utilities/store';
import {ValidationMixin, validate} from 'ember-cli-simple-validation/mixins/validate';

var PersonNewComponent = Ember.Component.extend(ValidationMixin, {
    repository: inject('person'),
    usernameValidation: validate('model.username'),
    passwordValidation: validate('model.password'),
    store: injectStore('main'),
    tab(){
        return this.get('store').find('tab', this.get('model.id'));
    },
    actions: {
        save() {
            this.set('submitted', true);
            if (this.get('valid')) {
                var model = this.get('model');
                var repository = this.get('repository');
                repository.insert(model).then(() => {
                    this.sendAction('save');
                });
            }
        },
        cancel() {
            this.sendAction('cancel', this.tab());
        }
    }
});

export default PersonNewComponent;
