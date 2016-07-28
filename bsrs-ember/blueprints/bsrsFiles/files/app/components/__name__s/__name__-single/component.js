import Ember from 'ember';
import injectRepo from 'bsrs-ember/utilities/inject';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import EditMixin from 'bsrs-ember/mixins/components/tab/edit';

export default Ember.Component.extend(TabMixin, EditMixin, {
  repository: injectRepo('<%= dasherizedModuleName %>'),
  <%= secondModelCamel %>Repo: injectRepo('<%= secondModel %>'),
  actions: {
    save() {
      if (this.get('model.validations.isValid')) {
        this._super(...arguments);
      }
      this.set('didValidate', true);
    }
  }
});
