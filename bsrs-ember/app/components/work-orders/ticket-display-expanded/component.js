import Ember from 'ember';
import injectRepo from 'bsrs-ember/utilities/inject';

const { get, set } = Ember;


export default Ember.Component.extend({
  currencyRepo: injectRepo('currency'),
  actions: {
    toggleIsExpanded() {
      this.get('toggleIsExpanded')();
    },
    setDate(date) {
      const model = get(this, 'model');
      set(model, 'scheduled_date', date);
    }
  }
});
