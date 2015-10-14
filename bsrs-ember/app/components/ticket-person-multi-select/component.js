import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import injectStore from 'bsrs-ember/utilities/store';

var TicketPeopleMulti = Ember.Component.extend({
    store: injectStore('main'),
    cc_selected: Ember.computed(function() {
        return this.get('ticket.cc') || [];
    }),
    options: Ember.computed('ticket_cc_options.[]', function() {
        return Ember.ArrayProxy.extend({
            content: Ember.computed(function() {
                let remote = this.get('remote');
                let selected = this.get('selected');
                selected.forEach(function(item) {
                    remote.pushObject(item);
                });
                return Ember.A(remote);
            })
        }).create({
            remote: this.get('ticket_cc_options'),
            selected: this.get('cc_selected')
        });

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
