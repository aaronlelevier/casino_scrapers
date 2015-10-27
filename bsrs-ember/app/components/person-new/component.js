import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import {ValidationMixin, validate} from 'ember-cli-simple-validation/mixins/validate';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import NewTabMixin from 'bsrs-ember/mixins/components/tab/new';

var PersonNewComponent = Ember.Component.extend(TabMixin, NewTabMixin, ValidationMixin, {
    repository: inject('person'),
    usernameValidation: validate('model.username'),
    passwordValidation: validate('model.password'),
    actions: {
        saveNew() {
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
