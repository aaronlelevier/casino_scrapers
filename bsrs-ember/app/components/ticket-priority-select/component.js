import Ember from 'ember';

var TicketPriority = Ember.Component.extend({
    priority_selected: Ember.computed('ticket.priority.id', function() {
        let ticket = this.get('ticket');
        return ticket.get('priority');
    }),
    options: Ember.computed('priorities.[]', 'ticket.priority.id', function() {
        let options = this.get('priorities');
        if (options && options.get('length') > 0) {
            return options;
        } else if(this.get('priority_selected')) {
            return Ember.A([this.get('priority_selected')]);
        }
        return Ember.A([]);
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
