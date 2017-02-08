import Ember from 'ember';
import injectRepo from 'bsrs-ember/utilities/inject';

const { get, set } = Ember;


export default Ember.Component.extend({
  currencyRepo: injectRepo('currency'),
  today: new Date(),
  rescheduling: false,
  actions: {
    toggleIsExpanded() {
      this.get('toggleIsExpanded')();
    },
    beginReschedule() {
      this.toggleProperty('rescheduling');
    },
    cancelReschedule() {
      const model = get(this, 'model');
      model.rollbackProperty('scheduled_date');
      this.toggleProperty('rescheduling');
    },
    setDate(date) {
      const model = get(this, 'model');
      set(model, 'scheduled_date', date);
    }
  }
});
