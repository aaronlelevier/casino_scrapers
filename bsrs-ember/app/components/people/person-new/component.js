import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import {ValidationMixin, validate} from 'ember-cli-simple-validation/mixins/validate';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import NewTabMixin from 'bsrs-ember/mixins/components/tab/new';//used for save method that returns a promise and transition to detail

var PersonNewComponent = Ember.Component.extend(TabMixin, NewTabMixin, ValidationMixin, {
  didValidate: false,
  repository: inject('person'),
  // usernameValidation: validate('model.username'),
  passwordValidation: validate('model.password'),
  actions: {
    save() {
      this.set('submitted', true);
      if (this.get('valid')) {
        if (this.get('model.validations.isValid')) {
          this._super().then(() => {
            this.sendAction('editPerson');
          });
        }
        this.set('didValidate', true);
      }
    },
  }
});

export default PersonNewComponent;
