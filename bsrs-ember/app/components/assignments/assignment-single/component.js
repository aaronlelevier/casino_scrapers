import Ember from 'ember';
import injectRepo from 'bsrs-ember/utilities/inject';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import EditMixin from 'bsrs-ember/mixins/components/tab/edit';

export default Ember.Component.extend(TabMixin, EditMixin, {
  didValidate: false,
  repository: injectRepo('assignment'),
  actions: {
    save() {
      let pfValid = true;
      this.get('model').get('pf').forEach((pf) => {
        pfValid = pfValid && pf.get('validations.isValid');
      });

      if (this.get('model.validations.isValid') && pfValid) {
        this._super(...arguments);
      }
      this.set('didValidate', true);
    }
  }
});
