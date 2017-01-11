import Ember from 'ember';
const { get } = Ember;

export default Ember.Component.extend({
  classNames: ['t-buttons'],
  actions: {
    dispatchWorkOrder() {
      get(this, 'dispatchWorkOrder')();
    },
    /**
     * yields up to closure action
     * @method next
     */
    next(next_step) {
      get(this, 'next')(next_step);
    },
    /**
     * yields up to closure action
     * @method back
     */
    back(prev_step) {
      get(this, 'back')(prev_step);
    },
    /**
     * yields up to closure action to close modal
     * @method done
     */
    done() {
      get(this, 'done')();
    }
  }
});
