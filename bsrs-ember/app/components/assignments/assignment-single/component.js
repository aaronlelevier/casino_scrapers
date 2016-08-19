import Ember from 'ember';
import injectRepo from 'bsrs-ember/utilities/inject';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import { task } from 'ember-concurrency';

var AssignmentSingle = Ember.Component.extend(TabMixin, {
  init() {
    this._super(...arguments);
    this.didValidate = false;
  },
  repository: injectRepo('assignment'),
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

export default AssignmentSingle;
