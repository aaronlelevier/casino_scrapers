import Ember from 'ember';

var TicketPriority = Ember.Component.extend({
    actions: {
        selected(priority) {
            this.get('ticket').change_priority(priority.get('id'));
        }
    }
});

export default TicketPriority;
