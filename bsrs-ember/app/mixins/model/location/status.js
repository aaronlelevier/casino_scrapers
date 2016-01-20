import Ember from 'ember';

var run = Ember.run;

var StatusMixin = Ember.Mixin.create({
    status: Ember.computed.alias('belongs_to.firstObject'),
    belongs_to: Ember.computed(function() {
        let location_id = this.get('id');
        let filter = function(status) {
            let locations = status.get('locations');
            return Ember.$.inArray(location_id, locations) > -1;
        };
        return this.get('store').find('location-status', filter);
    }),
    change_status(new_status_id) {
        let location_id = this.get('id');
        let store = this.get('store');
        let old_status = this.get('status');
        if(old_status) {
            let old_status_locations = old_status.get('locations') || [];
            let updated_old_status_locations = old_status_locations.filter((id) => {
                return id !== location_id;
            });
            run(function() {
                store.push('location-status', {id: old_status.get('id'), locations: updated_old_status_locations});
            });
            // old_status.set('locations', updated_old_status_locations);
        }
        let new_status = store.find('location-status', new_status_id);
        let new_status_locations = new_status.get('locations') || [];
        if (new_status_locations) {
            run(function() {
                store.push('location-status', {id: new_status.get('id'), locations: new_status_locations.concat(location_id)});
            });
            // new_status.set('locations', new_status_locations.concat(location_id));
        }
    },
    saveStatus() {
        const pk = this.get('id');
        const store = this.get('store');
        const status = this.get('status');
        if (status) {
            run(function() {
                store.push('location', {id: pk, status_fk: status.get('id')});
            });
        }
    },
    rollbackStatus() {
        let status = this.get('status');
        let status_fk = this.get('status_fk');
        if(status && status.get('id') !== status_fk) {
            this.change_status(status_fk);
        }
    },
});

export default StatusMixin;
