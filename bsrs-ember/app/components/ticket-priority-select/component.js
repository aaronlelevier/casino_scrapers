import Ember from 'ember';

var TicketPriority = Ember.Component.extend({
    actions: {
        selected(priority) {
            this.get('ticket').change_priority(priority ? priority.get('id') : null);
        }
    },
    classNames: ['ticket-priority-select']
});

export default TicketPriority;
