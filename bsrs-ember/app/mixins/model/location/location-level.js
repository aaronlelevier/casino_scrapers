import Ember from 'ember';

var run = Ember.run;

var LocationLevelMixin = Ember.Mixin.create({
    location_level: Ember.computed.alias('location_levels.firstObject'),
    location_levels: Ember.computed(function() {
        const pk = this.get('id');
        let filter = (location_level) => {
            let location_pks = location_level.get('locations') || [];
            return Ember.$.inArray(pk, location_pks) > -1;
        };
        return this.get('store').find('location-level', filter);
    }),
    change_location_level(new_location_level_id) {
        const location_id = this.get('id');
        const store = this.get('store');
        const old_location_level = this.get('location_level');
        if(old_location_level) {
            const old_locations = old_location_level.get('locations') || [];
            let updated_old_locations = old_locations.filter((id) => {
                return id !== location_id;
            });
            run(function() {
                store.push('location-level', {id: old_location_level.get('id'), locations: updated_old_locations});
            });
            // old_location_level.set('locations', updated_old_locations);
        }
        if(!new_location_level_id){
            return;
        } else{
            const new_location_level = store.find('location-level', new_location_level_id);
            const new_locations = new_location_level.get('locations') || [];
            run(function() {
                store.push('location-level', {id: new_location_level.get('id'), locations: new_locations.concat(location_id)});
            });
            // new_location_level.set('locations', new_locations.concat(location_id));
        }
    },
    saveLocationLevel() {
        const pk = this.get('id');
        const store = this.get('store');
        const location_level = this.get('location_level');
        if (location_level) {
            location_level.save();
            run(function() {
                store.push('location', {id: pk, location_level_fk: location_level.get('id')});
            });
            // this.set('location_level_fk', this.get('location_level').get('id'));
        } else {
            run(function() {
                store.push('location', {id: pk, location_level_fk: undefined});
            });
            // this.set('location_level_fk', undefined);
        }
    },
    rollbackLocationLevel() {
        const location_level = this.get('location_level');
        const location_level_fk = this.get('location_level_fk');
        this.change_location_level(location_level_fk);
    },
});

export default LocationLevelMixin;
