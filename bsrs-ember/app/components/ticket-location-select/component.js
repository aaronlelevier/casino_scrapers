import Ember from 'ember';

var TicketLocation = Ember.Component.extend({
    options: Ember.computed('ticket_location_options.[]', function() {
        let options = this.get('ticket_location_options');
        if (options && options.get('length') > 0) {
            return options;
        } else if(this.get('ticket_location_selected')) {
            return Ember.A([this.get('ticket_location_selected')]);
        }
        return Ember.A([]);
    }),
    find_all_locations(search) {
        this.set('search_location', search);
    },
    actions: {
        selected(location) {
            let ticket = this.get('ticket');
            if (location) {
                ticket.change_location(location.get('id'));
            }else{
                ticket.remove_location();
            }
        },
        update_filter(search) {
            Ember.run.debounce(this, this.get('find_all_locations'), search, 300);
        }
    }
});

export default TicketLocation;
