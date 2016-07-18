import Ember from 'ember';
import injectRepo from 'bsrs-ember/utilities/inject';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import EditMixin from 'bsrs-ember/mixins/components/tab/edit';

export default Ember.Component.extend(TabMixin, EditMixin, {
  repository: injectRepo('profile'),
  personRepo: injectRepo('person'),
  actions: {
    save() {
      const model = this.get('model');
      if (this.get('model.validations.isValid')) {
        this._super(...arguments);
      }
      this.set('didValidate', true);
    },
  }
});
