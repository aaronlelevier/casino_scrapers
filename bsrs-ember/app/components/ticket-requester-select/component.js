import Ember from 'ember';

var TicketCategories = Ember.Component.extend({
    cc_selected: Ember.computed('ticket.cc.[]', function() {
        let ticket = this.get('ticket');
        return ticket.get('requester');
    }),
    options: Ember.computed(function() {
        return this.get('ticket_cc_options') && this.get('ticket_cc_options').get('length') > 0 ? this.get('ticket_cc_options') : this.get('cc_selected');
    }),
    find_all_people() {
        let search_criteria = this.get('search_criteria');
        if (search_criteria) {
            this.set('search', search_criteria);
        }
    },
    actions: {
        selected(person) {
            let ticket = this.get('ticket');
            ticket.change_requester(person.get('id'));
        },
        update_filter() {
            Ember.run.debounce(this, this.get('find_all_people'), 300);
        }
    }
});

export default TicketCategories;
