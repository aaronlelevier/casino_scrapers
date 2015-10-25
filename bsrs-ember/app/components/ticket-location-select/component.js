import Ember from 'ember';

var TicketLocation = Ember.Component.extend({
    ticket_location_selected: Ember.computed('ticket.location.id', function() {
        let ticket = this.get('ticket');
        return ticket.get('location');
    }),
    options: Ember.computed('ticket_location_options.[]', 'ticket.location.id', 'search_location', function() {
        if (this.get('ticket_location_options') && this.get('ticket_location_options').get('length') > 0) {
            return this.get('ticket_location_options');
        } else if(this.get('ticket_location_selected')) {
            return Ember.A([this.get('ticket_location_selected')]);
        }
        return Ember.A([]);
    }),
    find_all_locations: function() {
        let search_criteria = this.get('search_criteria');
        this.set('search_location', search_criteria);
    },
    actions: {
        selected(location) {
            if (location) {
                let ticket = this.get('ticket');
                let location_pk = location.get('id');
                ticket.change_location(location_pk);
            }
        },
        update_filter() {
            Ember.run.debounce(this, this.get('find_all_locations'), 300);
        }
    }
});

export default TicketLocation;
