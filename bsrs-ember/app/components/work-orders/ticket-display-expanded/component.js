import Ember from 'ember';
import injectRepo from 'bsrs-ember/utilities/inject';

const { inject, get, set } = Ember;


export default Ember.Component.extend({
  currencyRepo: injectRepo('currency'),
  currency: inject.service(),
  today: new Date(),
  rescheduling: false,
  actions: {
    cancelReschedule() {
      const model = get(this, 'model');
      model.rollbackProperty('scheduled_date');
    },
    setDate(date) {
      const model = get(this, 'model');
      set(model, 'scheduled_date', date);
    }
  }
});
