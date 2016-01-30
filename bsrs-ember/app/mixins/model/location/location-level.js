import Ember from 'ember';
import { belongs_to, change_belongs_to, belongs_to_dirty, belongs_to_rollback, belongs_to_save } from 'bsrs-components/attr/belongs-to';

var run = Ember.run;

var LocationLevelMixin = Ember.Mixin.create({
    location_level: Ember.computed.alias('location_levels.firstObject'),
    location_levels: belongs_to('locations', 'location-level'),
    top_location_level: Ember.computed(function() {
        const filter = (llevel) => {
            return llevel.get('parents').get('length') === 0;
        };
        const llevels = this.get('store').find('location-level', filter);
        return llevels.objectAt(0);
    }),
    remove_children_parents() {
        const id = this.get('id');
        const store = this.get('store');
        const location_children = this.get('location_children');
        const location_parents = this.get('location_parents');
        const m2m_children_to_remove = location_children.reduce((arr, m2m) => {
            return m2m.get('location_pk') === id ? arr.concat(m2m.get('id')) : false;
        }, []);
        const m2m_parents_to_remove = location_parents.reduce((arr, m2m) => {
            return m2m.get('location_pk') === id ? arr.concat(m2m.get('id')) : false;
        }, []);
        m2m_children_to_remove.forEach((child) => {
            run(() => {
                store.push('location-children', {id: child, removed: true});
            });
        });
        m2m_parents_to_remove.forEach((child) => {
            run(() => {
                store.push('location-parents', {id: child, removed: true});
            });
        });
    },
    // change_location_level: change_belongs_to('locations', 'location-level'),
    change_location_level(new_location_level_id) {
        if(!this.get('new')){
            this.remove_children_parents();
        }
        const location_id = this.get('id');
        const store = this.get('store');
        const old_location_level = this.get('location_level');
        if(old_location_level) {
            const old_locations = old_location_level.get('locations') || [];
            let updated_old_locations = old_locations.filter((id) => {
                return id !== location_id;
            });
            run(() => {
                store.push('location-level', {id: old_location_level.get('id'), locations: updated_old_locations});
            });
        }
        if(!new_location_level_id){
            return;
        } else{
            const new_location_level = store.find('location-level', new_location_level_id);
            const new_locations = new_location_level.get('locations') || [];
            run(() => {
                store.push('location-level', {id: new_location_level.get('id'), locations: new_locations.concat(location_id)});
            });
        }
    },
    saveLocationLevel: belongs_to_save('location', 'location_level', 'location_level_fk'),
    rollbackLocationLevel() {
        const location_level = this.get('location_level');
        const location_level_fk = this.get('location_level_fk');
        this.change_location_level(location_level_fk);
    },
});

export default LocationLevelMixin;
