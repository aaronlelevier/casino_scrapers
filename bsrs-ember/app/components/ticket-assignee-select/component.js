import Ember from 'ember';

var TicketAssignee = Ember.Component.extend({
    options: Ember.computed('ticket_assignee_options.[]', function() {
        let options = this.get('ticket_assignee_options');
        if (options && options.get('length') > 0) {
            return options;
        }
    }),
    find_all_people(search) {
        this.set('search_assignee', search);
    },
    actions: {
        selected(person) {
            let ticket = this.get('ticket');
            if (person) {
                ticket.change_assignee(person.get('id'));
            } else {
                ticket.remove_assignee();
            }
        },
        update_filter(search) {
            Ember.run.debounce(this, this.get('find_all_people'), search, 300);
        }
    }
});

export default TicketAssignee;
