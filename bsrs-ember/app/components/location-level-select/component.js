import Ember from 'ember';
import inject from 'bsrs-ember/utilities/store';

let LocationLevelSelect = Ember.Component.extend({
    store: inject('main'),
    actions: {
        changed(model, val) {
            var manyRelationshipModel = this.get('manyRelationshipTo');
            var location_id = model.get('id');
            var new_location_level = this.get('store').find('location-level', val);
            var old_location_level = this.get('model');
            var new_location_level_locations = new_location_level.get(manyRelationshipModel) || [];
            Ember.run(() => {
                if(new_location_level.get('content')) {
                    new_location_level.set(manyRelationshipModel, new_location_level_locations.concat([location_id]));
                }
                if(old_location_level) {
                    var old_location_level_locations = old_location_level.get(manyRelationshipModel) || [];
                    old_location_level.set(manyRelationshipModel, old_location_level_locations.filter((old_location_level_location_pk) => {
                        return old_location_level_location_pk !== location_id;
                    }));
                    old_location_level.save();
                }
            });
        }
    }
});

export default LocationLevelSelect;
