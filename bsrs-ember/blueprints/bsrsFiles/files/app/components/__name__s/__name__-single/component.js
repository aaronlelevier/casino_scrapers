import Ember from 'ember';
import injectRepo from 'bsrs-ember/utilities/inject';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import { task } from 'ember-concurrency';

export default Ember.Component.extend(TabMixin, {
  // For db-fetch if applicable
  <%= secondModelCamel %>Repo: injectRepo('<%= secondModel %>'),
  <%= thirdAssociatedModelCamel %>Repo: injectRepo('<%= secondModel %>'),
  saveTask: task(function * () {
    if (this.get('model.validations.isValid')) {
      const tab = this.tab();
      yield this.get('save')(tab);
    }
  }),
  actions: {
    save() {
      this.get('saveTask').perform();
    }
  }
});
