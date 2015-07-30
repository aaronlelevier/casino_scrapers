import Ember from 'ember';

export default Ember.Object.extend({
    find() {
        var store = this.get('store');
        return store.find('phonenumber');
    }
}); 
