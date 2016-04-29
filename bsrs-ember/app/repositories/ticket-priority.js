import Ember from 'ember';

var TicketPriorityRepo = Ember.Object.extend({
    fetch() {
        let store = this.get('simpleStore');
        return store.find('ticket-priority');
    }
});

export default TicketPriorityRepo;
