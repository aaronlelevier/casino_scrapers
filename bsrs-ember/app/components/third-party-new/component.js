import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import NewMixin from 'bsrs-ember/mixins/components/tab/new';
import {ValidationMixin, validate} from 'ember-cli-simple-validation/mixins/validate';

var ThirdPartysNewComponent = Ember.Component.extend(TabMixin, NewMixin, ValidationMixin, {
  repository: inject('third-party'),
  nameValidation: validate('model.name'),
  numberValidation: validate('model.number'),
  statusValidation: validate('model.status'),
  actions: {
    save() {
      this.set('submitted', true);
      if (this.get('valid')) {
        const tab = this.tab();
        return this.get('save')(tab);
      }
    },
    changedStatus(model, val) {
      model.set('status', val);
    }
  }
});

export default ThirdPartysNewComponent;
