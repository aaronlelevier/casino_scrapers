import Ember from 'ember';

export default Ember.Object.extend({
    find: function() {
        var store = this.get('store');
        return store.find('address');
    },
    findByPersonId: function(person_id) {
        var store = this.get('store'); 
        return store.find('address', {person_id: person_id});
    }
});
