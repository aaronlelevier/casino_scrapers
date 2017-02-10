import Ember from 'ember';
const { computed, get, set } = Ember;

export default Ember.Component.extend({
  classNames: ['animated-fast', 'fadeIn'],
  today: new Date(),
  actions: {
    setDate(date) {
      const model = get(this, 'model');
      set(model, 'scheduled_date', date);
    }
  }
});
