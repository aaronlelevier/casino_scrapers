import Ember from 'ember';

export default Ember.Object.extend({
  find() {
    var store = this.get('simpleStore');
    return store.find('email-type');
  },
  get_default() {
    var store = this.get('simpleStore');
    return store.find('email-type', {name: 'admin.emailtype.work'}).objectAt(0);
  }
}); 
