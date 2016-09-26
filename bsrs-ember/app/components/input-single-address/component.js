import Ember from 'ember';
const { run } = Ember;

export default Ember.Component.extend({
  actions: {
    delete(entry) {
      run(() => {
        this.get('model').remove_address(entry.get('id'));
      });
    },
  }
});
