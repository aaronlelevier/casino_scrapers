import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import { task } from 'ember-concurrency';

var RoleSingle = Ember.Component.extend(TabMixin, {
  init() {
    this._super(...arguments);
    this.didValidate = false;
  },
  repository: inject('role'),
  simpleStore: Ember.inject.service(),
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
    },
  }
});

export default RoleSingle;
