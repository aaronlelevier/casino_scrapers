import Ember from 'ember';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import NewMixin from 'bsrs-ember/mixins/components/tab/new';
import {ValidationMixin, validate} from 'ember-cli-simple-validation/mixins/validate';

var ThirdPartysNewComponent = Ember.Component.extend(TabMixin, NewMixin, ValidationMixin, {
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
  }
});

export default ThirdPartysNewComponent;
