import Ember from 'ember';

export default Ember.Object.extend({
    find() {
        var store = this.get('simpleStore');
        return store.find('phone-number-type');
    },
    get_default() {
        var store = this.get('simpleStore');
        return store.find('phone-number-type', {name: 'admin.phonenumbertype.office'}).objectAt(0);
    }
}); 
