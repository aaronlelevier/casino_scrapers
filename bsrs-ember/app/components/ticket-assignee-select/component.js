import Ember from 'ember';

var TicketAssignee = Ember.Component.extend({
    assignee_selected: Ember.computed('ticket.assignee', function() {
        let ticket = this.get('ticket');
        return ticket.get('assignee');
    }),
    options: Ember.computed('ticket.assignee', 'ticket_assignee_options.[]', function() {
        let options = this.get('ticket_assignee_options');
        if (options && options.get('length') > 0) {
            return options;
        } else if(this.get('assignee_selected')) {
            return Ember.A([this.get('assignee_selected')]);
        }
    }),
    find_all_people() {
        let search_criteria = this.get('search_criteria');
        this.set('search_assignee', search_criteria);
    },
    actions: {
        selected(person) {
            let ticket = this.get('ticket');
            ticket.change_assignee(person.get('id'));
        },
        update_filter() {
            Ember.run.debounce(this, this.get('find_all_people'), 300);
        }
    }
});

export default TicketAssignee;
