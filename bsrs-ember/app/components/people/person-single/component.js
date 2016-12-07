import Ember from 'ember';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import { task } from 'ember-concurrency';

// function validatePassword() {
//   if (this.changingPassword && (this.get('model.password').length > 0 || this.get('model.password') === '')) {
//     return true;
//   } else if (!this.changingPassword) {
//     return true;
//   }
// }

var PersonSingle = Ember.Component.extend(TabMixin, {
  simpleStore: Ember.inject.service(),
  // passwordValidation: validate('model.password', validatePassword),
  saveTask: task(function * () {
    if (this.get('model.validations.isValid')) {
      const tab = this.tab();
      yield this.get('save')(tab);
    }
  }),
  actions: {
    save() {
      this.get('saveTask').perform();
    },
  }
});

export default PersonSingle;
