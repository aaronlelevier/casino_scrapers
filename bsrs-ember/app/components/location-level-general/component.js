import Ember from 'ember';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
// import prevent_duplicate_name from 'bsrs-ember/validation/prevent_duplicate_name';
import { task } from 'ember-concurrency';

var LocationLevelGeneral = Ember.Component.extend(TabMixin, {
  init() {
    this._super(...arguments);
    this.didValidate = false;
  },
  classNames: ['wrapper', 'form'],
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

export default LocationLevelGeneral;
