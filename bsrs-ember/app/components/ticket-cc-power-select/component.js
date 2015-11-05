import Ember from 'ember';

var TicketPeopleMulti = Ember.Component.extend({
    // cc_selected: Ember.computed('ticket.cc.[]', function() {
    //     let ticket = this.get('ticket');
    //     return ticket.get('cc');
    // }),
    // options: Ember.computed('ticket.cc.[]', function() {
    //     return this.get('ticket_cc_options') && this.get('ticket_cc_options').get('length') > 0 ? this.get('ticket_cc_options') : this.get('cc_selected');
    // }),
    // find_all_people() {
    //     let search_criteria = this.get('search_criteria');
    //     if (search_criteria) {
    //         this.set('search', search_criteria);
    //     }
    // },
    actions: {
        add(person) {
            let ticket = this.get('ticket');
            ticket.add_person(person.get('id'));
        },
        remove(person) {
            let ticket = this.get('ticket');
            ticket.remove_person(person.get('id'));
        },
        update_filter() {
            // Ember.run.debounce(this, this.get('find_all_people'), 300);
            this.set('search', search_criteria);
        }
    }
});

export default TicketPeopleMulti;
