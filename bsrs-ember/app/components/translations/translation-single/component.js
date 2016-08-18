import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';

var TranslationSingle = Ember.Component.extend(TabMixin, {
  repository: inject('translation'),
  actions: {
    save() {
      const tab = this.tab();
      return this.get('save')(tab);
    }
  }
});

export default TranslationSingle;
