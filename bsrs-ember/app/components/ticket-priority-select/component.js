import Ember from 'ember';

var TicketPriority = Ember.Component.extend({
    priority_selected: Ember.computed(function() {
        let ticket = this.get('ticket');
        return ticket.get('priority');
    }),
    actions: {
        selected(priority) {
            let ticket = this.get('ticket');
            if (priority) {
                ticket.change_priority(priority.get('id'));
            } else {
                ticket.remove_priority();
            }
        },
    }
});

export default TicketPriority;
