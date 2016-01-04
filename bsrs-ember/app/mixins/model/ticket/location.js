import Ember from 'ember';

var TicketLocationMixin = Ember.Mixin.create({
    location: Ember.computed.alias('belongs_to_location.firstObject'),
    belongs_to_location: Ember.computed('location_fk', function() {
        let ticket_id = this.get('id');
        let filter = function(location) {
            let tickets = location.get('tickets');
            return Ember.$.inArray(ticket_id, tickets) > -1;
        };
        return this.get('store').find('location', filter);
    }),
    remove_location() {
        let ticket_id = this.get('id');
        let store = this.get('store');
        let old_location = this.get('location');
        if(old_location) {
            let old_location_tickets = old_location.get('tickets') || [];
            let updated_old_location_tickets = old_location_tickets.filter(function(id) {
                return id !== ticket_id;
            });
            store.push('location', {id: old_location.get('id'), tickets: updated_old_location_tickets});
        }
    },
    change_location: function(new_location_id) {
        let ticket_id = this.get('id');
        let store = this.get('store');
        this.remove_location();
        let new_location = store.find('location', new_location_id);
        let new_location_tickets = new_location.get('tickets') || [];
        store.push('location', {id: new_location.get('id'), tickets: new_location_tickets.concat(ticket_id)});
    },
    saveLocation() {
        const ticket_pk = this.get('id');
        const store = this.get('store');
        const location = this.get('location');
        if (location) {
            store.push('ticket', {id: ticket_pk, location_fk: location.get('id')});
        }
    },
    rollbackLocation() {
        let location = this.get('location');
        let location_fk = this.get('location_fk');
        if(location && location.get('id') !== location_fk) {
            this.change_location(location_fk);
        }
    },
});

export default TicketLocationMixin;
