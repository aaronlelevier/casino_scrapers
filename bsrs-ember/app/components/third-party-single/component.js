import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import {ValidationMixin, validate} from 'ember-cli-simple-validation/mixins/validate';

var ThirdPartySingle = Ember.Component.extend(TabMixin, ValidationMixin, {
  repository: inject('third-party'),
  nameValidation: validate('model.name'),
  numberValidation: validate('model.number'),
  actions: {
    save() {
      this.set('submitted', true);
      if (this.get('valid')) {
        const model = this.get('model');
        const tab = this.tab();
        return this.get('save')(model, this.get('repository'), tab);
      }
    },
    changedStatus(model, val) {
      model.set('status', val);
    }
  }
});

export default ThirdPartySingle;
