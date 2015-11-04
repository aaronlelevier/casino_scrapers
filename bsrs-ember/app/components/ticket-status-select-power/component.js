import Ember from 'ember';

var TicketStatus = Ember.Component.extend({
    actions: {
        selected(status) {
            this.get('ticket').change_status(status.get('id'));
        },
    }
});

export default TicketStatus;
