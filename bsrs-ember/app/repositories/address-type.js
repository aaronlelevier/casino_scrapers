import Ember from 'ember';

export default Ember.Object.extend({
    find: function() {
        var store = this.get('store');
        return store.find("address-type");
    }
});
