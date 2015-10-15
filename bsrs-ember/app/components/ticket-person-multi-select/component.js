import Ember from 'ember';

var TicketPeopleMulti = Ember.Component.extend({
    cc_selected: Ember.computed('ticket.cc.[]', function() {
        let ticket = this.get('ticket');
        return ticket.get('cc');
    }),
    options: Ember.computed('ticket.cc.[]', function() {
        let cc_selected = this.get('cc_selected');
        let ticket_cc_options = this.get('ticket_cc_options');
        if (!ticket_cc_options || ticket_cc_options.get('length') === 0) { 
            return cc_selected; 
        }
        cc_selected.map((selected) => {
            ticket_cc_options.pushObject(selected); 
        });
        return ticket_cc_options;
    }),
    find_all_people() {
        let search_criteria = this.get('search_criteria');
        if (search_criteria) {
            this.set('search', search_criteria);
        }
    },
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
            Ember.run.debounce(this, this.get('find_all_people'), 300);
        }
    }
});

export default TicketPeopleMulti;
