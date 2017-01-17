import Ember from 'ember';
import injectRepo from 'bsrs-ember/utilities/inject';

const { get, set } = Ember;

let timelineItems = ['work_order.status.sent', 'work_order.status.scheduled',
  'work_order.status.on_site', 'work_order.status.complete',
  'work_order.status.invoiced', 'work_order.status.paid'];

export default Ember.Component.extend({
  currencyRepo: injectRepo('currency'),
  timelineItems: timelineItems,
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
