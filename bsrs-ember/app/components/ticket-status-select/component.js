import Ember from 'ember';

var TicketStatus = Ember.Component.extend({
    actions: {
        selected(status) {
            let ticket = this.get('ticket');
            if (status) {
                ticket.change_status(status.get('id'));
            } else {
                ticket.remove_status();
            }
        },
    }
});

export default TicketStatus;
