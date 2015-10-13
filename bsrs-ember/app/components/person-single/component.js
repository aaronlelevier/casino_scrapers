import Ember from 'ember';
import ParentValidationComponent from 'bsrs-ember/mixins/validation/parent';
import { validate } from 'ember-cli-simple-validation/mixins/validate';

var PersonSingle = ParentValidationComponent.extend({
    child_components: ['input-multi-phone', 'input-multi-address'],
    classNames: ['wrapper', 'form'],
    attemptedTransition: '',
    usernameValidation: validate('model.username'),
    actions: {
        save() {
            this.set('submitted', true);
            if (this.all_components_valid()) {
                this._super();
            }
        },
        localeChanged(locale){
            this.sendAction('localeChanged', locale);
        },
        changePassword(){
            this.sendAction('changePassword');
        }
    }
});

export default PersonSingle;
