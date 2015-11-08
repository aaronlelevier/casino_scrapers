import Ember from 'ember';

var TicketPeopleMulti = Ember.Component.extend({
    find_all_people(search) {
        this.set('search_cc', search);
    },
    actions: {
        change_cc(new_cc_selection) {
            const ticket = this.get('ticket');
            const old_cc_selection = ticket.get('cc');
            const old_cc_ids = ticket.get('cc_ids');
            const new_cc_ids = new_cc_selection.map((new_cc) => {
                return new_cc.get('id');
            });

            new_cc_selection.forEach((cc) => {
                if (Ember.$.inArray(cc.get('id'), old_cc_ids) < 0) {
                    ticket.add_person(cc.get('id'));
                }
            });
            old_cc_selection.forEach((old_cc) => {
                if (Ember.$.inArray(old_cc.get('id'), new_cc_ids) < 0) {
                    ticket.remove_person(old_cc.get('id'));
                }
            }); 
        },
        update_filter(search) {
            Ember.run.debounce(this, this.get('find_all_people'), search, 300);
        }
    }
});

export default TicketPeopleMulti;
