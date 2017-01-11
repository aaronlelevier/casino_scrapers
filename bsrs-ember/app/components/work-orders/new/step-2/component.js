import Ember from 'ember';
const { get, set } = Ember;

export default Ember.Component.extend({
  classNames: ['animated-fast', 'fadeIn'],
  actions: {
    setDate(date) {
      const model = get(this, 'model');
      set(model, 'scheduled_date', date);
    }
  }
});
