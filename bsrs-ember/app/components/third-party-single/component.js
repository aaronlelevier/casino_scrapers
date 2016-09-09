import Ember from 'ember';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import {ValidationMixin, validate} from 'ember-cli-simple-validation/mixins/validate';

var ThirdPartySingle = Ember.Component.extend(TabMixin, ValidationMixin, {
  nameValidation: validate('model.name'),
  numberValidation: validate('model.number'),
  actions: {
    save() {
      this.set('submitted', true);
      if (this.get('valid')) {
        const tab = this.tab();
        return this.get('save')(tab);
      }
    },
  }
});

export default ThirdPartySingle;
