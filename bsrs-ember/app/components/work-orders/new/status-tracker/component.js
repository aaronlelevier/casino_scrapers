import Ember from 'ember';
const { get } = Ember;

export default Ember.Component.extend({
  classNames: ['timeline', 'flex', 't-status-tracker'],
  actions: {
    /**
     * @method determineStep
     * @param {String} next_step
    */
    determineStep(transition_to_step) {
      get(this, 'determineStep')(transition_to_step);
    }
  }
});
