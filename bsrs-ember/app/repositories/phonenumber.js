import Ember from 'ember';

export default Ember.Object.extend({
  find() {
    var store = this.get('simpleStore');
    return store.find('phonenumber');
  }
}); 
