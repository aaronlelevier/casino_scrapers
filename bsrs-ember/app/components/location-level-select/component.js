import Ember from 'ember';
import inject from 'bsrs-ember/utilities/store';

let LocationLevelSelect = Ember.Component.extend({
    selected: Ember.computed('model.location_level', function() {
        return this.get('model').get('location_level');
    }),
    actions: {
        selected(location_level) {
            const model = this.get('model');
            if(!location_level){
                model.change_location_level();
            }else{
                model.change_location_level(location_level.get('id'));
            }
            
            // const manyRelationshipModel = this.get('manyRelationshipTo');
            // const location_id = model.get('id');
            // const new_location_level = this.get('store').find('location-level', val);
            // const old_location_level = this.get('model');
            // const new_location_level_locations = new_location_level.get(manyRelationshipModel) || [];
            // Ember.run(() => {
            //     if(new_location_level.get('content')) {
            //         new_location_level.set(manyRelationshipModel, new_location_level_locations.concat([location_id]));
            //         new_location_level.save();
            //     }
            //     if(old_location_level) {
            //         const old_location_level_locations = old_location_level.get(manyRelationshipModel) || [];
            //         old_location_level.set(manyRelationshipModel, old_location_level_locations.filter((old_location_level_location_pk) => {
            //             return old_location_level_location_pk !== location_id;
            //         }));
            //         old_location_level.save();
            //     }
            // });
        }
    }
});

export default LocationLevelSelect;
