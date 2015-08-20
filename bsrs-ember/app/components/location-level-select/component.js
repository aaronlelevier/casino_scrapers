import Ember from 'ember';
import inject from 'bsrs-ember/utilities/store';

export default Ember.Component.extend({
    store: inject('main'),
    actions: {
        changed(model, val) {
            var location_id = model.get('id');
            var new_location_level = this.get('store').find('location-level', val);
            var old_location_level = this.get('model');

            var new_location_level_locations = new_location_level.get('locations') || [];

            Ember.run(() => {
                if(new_location_level.get('content')) {
                    new_location_level.set('locations', new_location_level_locations.concat([location_id]));
                }
                if(old_location_level) {
                    var old_location_level_locations = old_location_level.get('locations') || [];
                    old_location_level.set('locations', old_location_level_locations.filter((old_location_level_location_pk) => {
                        return old_location_level_location_pk !== location_id;
                    }));
                    old_location_level.save();
                }
            });
        }
    }
});
