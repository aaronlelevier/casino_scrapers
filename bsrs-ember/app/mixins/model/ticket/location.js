import Ember from 'ember';

var LocationMixin = Ember.Mixin.create({
    location: Ember.computed('belongs_to_location.[]', function() {
        let belongs_to_location = this.get('belongs_to_location');
        return belongs_to_location.objectAt(0);
    }),
    belongs_to_location: Ember.computed('location_fk', function() {
        let ticket_id = this.get('id');
        let filter = function(location) {
            let tickets = location.get('tickets');
            return Ember.$.inArray(ticket_id, tickets) > -1;
        };
        return this.get('store').find('location', filter, ['tickets']);
    }),
    change_location: function(new_location_id) {
        let ticket_id = this.get('id');
        let store = this.get('store');
        let old_location = this.get('location');
        if(old_location) {
            let old_location_tickets = old_location.get('tickets') || [];
            let updated_old_location_tickets = old_location_tickets.filter(function(id) {
                return id !== ticket_id;
            });
            old_location.set('tickets', updated_old_location_tickets);
        }
        let new_location = store.find('location', new_location_id);
        let new_location_tickets = new_location.get('tickets') || [];
        new_location.set('tickets', new_location_tickets.concat(ticket_id));
    },
    saveLocation() {
        let location = this.get('location');
        if (location) { this.set('location_fk', location.get('id')); }
    },
    rollbackLocation() {
        let location = this.get('location');
        let location_fk = this.get('location_fk');
        if(location && location.get('id') !== location_fk) {
            this.change_location(location_fk);
        }
    },
});

export default LocationMixin;


