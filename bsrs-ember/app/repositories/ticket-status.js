import Ember from 'ember';

var TicketStatusRepo = Ember.Object.extend({
    fetch() {
        let store = this.get('store');
        return store.find('ticket-status');
    }
});

export default TicketStatusRepo;
