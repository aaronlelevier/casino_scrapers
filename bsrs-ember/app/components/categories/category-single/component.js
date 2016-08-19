import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import {ValidationMixin, validate} from 'ember-cli-simple-validation/mixins/validate';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import { task } from 'ember-concurrency';

var CategorySingleComponent = Ember.Component.extend(TabMixin, ValidationMixin, {
  repository: inject('category'),
  nameValidation: validate('model.name'),
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
    }
  }
});

export default CategorySingleComponent;
