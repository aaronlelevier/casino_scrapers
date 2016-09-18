import Ember from 'ember';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';

var ThirdPartySingle = Ember.Component.extend(TabMixin, {
  init() {
    this._super(...arguments);
    this.didValidate = false;
  },
  actions: {
    save() {
      if (this.get('model.validations.isValid')) {
        const tab = this.tab();
        return this.get('save')(tab);
      }
      this.set('didValidate', true);
    },
  }
});

export default ThirdPartySingle;
