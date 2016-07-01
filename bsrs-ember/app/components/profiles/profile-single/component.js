import Ember from 'ember';
import injectRepo from 'bsrs-ember/utilities/inject';
import { ValidationMixin, validate } from 'ember-cli-simple-validation/mixins/validate';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import EditMixin from 'bsrs-ember/mixins/components/tab/edit';

export default Ember.Component.extend(TabMixin, EditMixin, ValidationMixin, {
  repository: injectRepo('profile'),
  actions: {
    save() {
      this.set('submitted', true);
      if (this.get('valid')) {
        this._super();
      }
    }
  }
});