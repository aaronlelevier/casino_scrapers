import Ember from 'ember';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import {ValidationMixin, validate} from 'ember-cli-simple-validation/mixins/validate';
import prevent_duplicate_name from 'bsrs-ember/validation/prevent_duplicate_name';
import { task } from 'ember-concurrency';

var LocationLevelGeneral = Ember.Component.extend(TabMixin, ValidationMixin, {
  classNames: ['wrapper', 'form'],
  nameValidation: validate('model.name', prevent_duplicate_name),
  saveTask: task(function * () {
    this.set('submitted', true);
    if (this.get('valid')) {
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

export default LocationLevelGeneral;
