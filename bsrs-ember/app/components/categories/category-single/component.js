import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import {ValidationMixin, validate} from 'ember-cli-simple-validation/mixins/validate';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';

var CategorySingleComponent = Ember.Component.extend(TabMixin, ValidationMixin, {
  repository: inject('category'),
  nameValidation: validate('model.name'),
  actions: {
    save() {
      this.set('submitted', true);
      if (this.get('valid')) {
        const model = this.get('model');
        const tab = this.tab();
        return this.get('save')(model, this.get('repository'), tab);
      }
    }
  }
});

export default CategorySingleComponent;
