import Ember from 'ember';

var TicketPeopleMulti = Ember.Component.extend({
    cc_selected: Ember.computed('ticket.cc.[]', function() {
        let ticket = this.get('ticket');
        return ticket.get('cc');
    }),
    // options: Ember.computed('ticket.cc.[]', 'ticket_cc_options.[]', 'search_cc', function() {
    //     // let cc = Ember.A([]);
    //     // let cc_options = this.get('ticket_cc_options');
    //     // if (cc_options) {
    //     //     cc.pushObjects(cc_options);
    //     // }
    //     // return cc;
    //     return this.get('ticket_cc_options');
    //     // return this.get('ticket_cc_options') && this.get('ticket_cc_options').get('length') > 0 ? this.get('ticket_cc_options') : this.get('cc_selected');
    // }),
    find_all_people(search) {
        this.set('search_cc', search);
    },
    actions: {
        add(person) {
            let length = person.length - 1;
            let ticket = this.get('ticket');
            ticket.add_person(person.objectAt(length).get('id'));
        },
        remove(person) {
            let ticket = this.get('ticket');
            ticket.remove_person(person.get('id'));
        },
        update_filter(search) {
            Ember.run.debounce(this, this.get('find_all_people'), search, 300);
        }
    }
});

export default TicketPeopleMulti;
