import Ember from 'ember';
import injectRepo from 'bsrs-ember/utilities/inject';
import { ValidationMixin, validate } from 'ember-cli-simple-validation/mixins/validate';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import EditMixin from 'bsrs-ember/mixins/components/tab/edit';

function <%= firstPropertyCamel %>Validation() {
  const val = this.get('model.<%= firstPropertySnake %>');
  return val && val.length <= 500;
}

export default Ember.Component.extend(TabMixin, EditMixin, ValidationMixin, {
  repository: injectRepo('<%= dasherizedModuleName %>s'),
  <%= secondModelCamel %>Repo: injectRepo('<%= secondModel %>'),
  <%= firstPropertyCamel %>Validation: validate('model.<%= firstPropertySnake %>', <%= firstPropertyCamel %>Validation),
  actions: {
    save() {
      this.set('submitted', true);
      if (this.get('valid')) {
        this._super();
      }
    }
  }
});
