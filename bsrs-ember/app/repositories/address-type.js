import Ember from 'ember';

export default Ember.Object.extend({
  find() {
    var store = this.get('simpleStore');
    return store.find('address-type');
  },
  get_default() {
    var store = this.get('simpleStore');
    return store.find('address-type', {name: 'admin.address_type.office'}).objectAt(0);
  }
});
