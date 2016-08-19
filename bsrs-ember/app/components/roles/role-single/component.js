import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import {ValidationMixin, validate} from 'ember-cli-simple-validation/mixins/validate';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import ChangeBoolMixin from 'bsrs-ember/mixins/components/change-bool';
import { task } from 'ember-concurrency';

var RoleSingle = Ember.Component.extend(TabMixin, ValidationMixin, ChangeBoolMixin, {
  repository: inject('role'),
  simpleStore: Ember.inject.service(),
  nameValidation: validate('model.name'),
  locationLevelValidation: validate('model.location_level'),
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
    changedLocLevel(model, val) {
      model.set('location_level', val);
    },
  }
});

export default RoleSingle;
