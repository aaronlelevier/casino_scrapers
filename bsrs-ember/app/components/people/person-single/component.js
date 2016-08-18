import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import ParentValidationComponent from 'bsrs-ember/mixins/validation/parent';
import { validate } from 'ember-cli-simple-validation/mixins/validate';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import RelaxedMixin from 'bsrs-ember/mixins/validation/relaxed';

function validatePassword() {
  if (this.changingPassword && (this.get('model.password').length > 0 || this.get('model.password') === '')) {
    return true;
  } else if (!this.changingPassword) {
    return true;
  }
}

var PersonSingle = ParentValidationComponent.extend(RelaxedMixin, TabMixin, {
  didValidate: false,
  simpleStore: Ember.inject.service(),
  // currency: Ember.inject.service(),
  repository: inject('person'),
  child_components: ['input-multi-phone', 'input-multi-address', 'input-multi-email'],
  classNames: ['wrapper', 'form'],
  passwordValidation: validate('model.password', validatePassword),
  actions: {
    save() {
      this.set('submitted', true);
      if (this.all_components_valid()) {
        if (this.get('model.validations.isValid')) {
          const tab = this.tab();
          return this.get('save')(tab);
        }
        this.set('didValidate', true);
      }
    },
    // localeChanged(locale) {
    //   this.sendAction('localeChanged', locale);
    // },
    changeBool(key) {
      // closure action to credentials section
      const store = this.get('simpleStore');
      let model = store.find('person', this.get('model.id'));
      model.toggleProperty(key);
    }
  }
});

export default PersonSingle;
