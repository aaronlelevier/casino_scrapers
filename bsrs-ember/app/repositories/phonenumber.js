import Ember from 'ember';

export default Ember.Object.extend({
    find() {
        var store = this.get('store');
        return store.find('phonenumber');
    },
    findByPersonId: function(person_id) {
        var store = this.get('store'); 
        return store.find('phonenumber', {person_id: person_id});
    }
}); 
