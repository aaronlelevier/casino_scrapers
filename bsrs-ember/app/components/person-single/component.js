import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import ParentValidationComponent from 'bsrs-ember/mixins/validation/parent';
import { validate } from 'ember-cli-simple-validation/mixins/validate';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import EditMixin from 'bsrs-ember/mixins/components/tab/edit';
import RelaxedMixin from 'bsrs-ember/mixins/validation/relaxed';

function validatePassword(){
    if(this.changingPassword && this.get('model.password').length > 0){
        return true;
    }else if(!this.changingPassword){
        return true;
    }
}
function validateSingleChar(middle_init){
    if(middle_init) {
        return middle_init.length < 2 ? true : false;
    }
    return true;
}

var PersonSingle = ParentValidationComponent.extend(RelaxedMixin, TabMixin, EditMixin, {
    repository: inject('person'),
    child_components: ['input-multi-phone', 'input-multi-address'],
    classNames: ['wrapper', 'form'],
    attemptedTransition: '',
    usernameValidation: validate('model.username'),
    middleInitialValidation: validate('model.middle_initial', validateSingleChar),
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
