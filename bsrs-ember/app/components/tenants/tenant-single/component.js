import Ember from 'ember';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import { task } from 'ember-concurrency';

export default Ember.Component.extend(TabMixin, {
  init() {
    this._super(...arguments);
    this.didValidate = false;
  },
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
