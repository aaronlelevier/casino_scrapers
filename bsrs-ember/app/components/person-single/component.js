import Ember from 'ember';
import ParentValidationComponent from 'bsrs-ember/mixins/validation/parent';
import { validate } from 'ember-cli-simple-validation/mixins/validate';

function validatePassword(){
    if(this.changingPassword && this.get('model.password').length > 0){
        return true;
    }else if(!this.changingPassword){
        return true;
    }
}

var PersonSingle = ParentValidationComponent.extend({
    child_components: ['input-multi-phone', 'input-multi-address'],
    classNames: ['wrapper', 'form'],
    attemptedTransition: '',
    usernameValidation: validate('model.username'),
    passwordValidation: validate('model.password', validatePassword),
    changingPassword: false,
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
            this.toggleProperty('changingPassword');
            this.get('model').clearPassword();
        }
    }
});

export default PersonSingle;
