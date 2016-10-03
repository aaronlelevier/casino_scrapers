import Ember from 'ember';
const { run } = Ember;

/*
 * override email valuePath with something like implementation_email
 */
export default Ember.Component.extend({
  valuePath: 'email',
  actions: {
    delete(entry) {
      run(() => {
        this.get('model').remove_email(entry.get('id'));
      });
    }
  }
});
