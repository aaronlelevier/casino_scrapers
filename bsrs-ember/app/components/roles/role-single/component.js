import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import { task } from 'ember-concurrency';

var RoleSingle = Ember.Component.extend(TabMixin, {
  repository: inject('role'),
  simpleStore: Ember.inject.service(),
  saveTask: task(function * () {
    const model = this.get('model');
    if (model.get('validations.isValid')) {
      const tab = this.tab();
      yield this.get('save')(tab).finally(() => {
        if (model.get('ajaxError')) {
          // not doing anything yet.  Maybe set btn on error or ignore by clearing the error
        }
      });
    }
  }),
  actions: {
    save() {
      this.get('saveTask').perform();
    },
  }
});

export default RoleSingle;
