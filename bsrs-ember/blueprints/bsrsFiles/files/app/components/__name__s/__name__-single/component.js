import Ember from 'ember';
import injectRepo from 'bsrs-ember/utilities/inject';
iimport TabMixin from 'bsrs-ember/mixins/components/tab/base';

export default Ember.Component.extend(TabMixin, {
  repository: injectRepo('<%= dasherizedModuleName %>'),
  // For db-fetch if applicable
  <%= secondModelCamel %>Repo: injectRepo('<%= secondModel %>'),
  saveTask: task(function * () {
    if (this.get('model.validations.isValid')) {
      const tab = this.tab();
      yield this.get('save')(tab);
    }
    this.set('didValidate', true);
  }),
  actions: {
    save() {
      this.get('saveTask').perform();
    }
  }
});
