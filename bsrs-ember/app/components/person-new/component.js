import Ember from 'ember';
import BaseComponent from 'bsrs-ember/components/base-component-new/component';
import {ValidationMixin, validate} from 'ember-cli-simple-validation/mixins/validate';

var PersonNewComponent = BaseComponent.extend(ValidationMixin, {
    usernameValidation: validate('model.username'),
    passwordValidation: validate('model.password'),
    actions: {
        save() {
            this.set('submitted', true);
            if (this.get('valid')) {
                this._super();
                this.sendAction('editPerson');
            }
        },
        cancel() {
            this.sendAction('cancel', this.tab());
        }
    }
});

export default PersonNewComponent;
