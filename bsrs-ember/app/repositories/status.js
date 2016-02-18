import Ember from 'ember';

export default Ember.Object.extend({
    find() {
        const store = this.get('store');
        return store.find('status');
    },
    get_default() {
        const store = this.get('store');
        return store.find('status', {name: 'admin.person.status.active'}).objectAt(0);
    }
});
