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
        }
    }
});

export default LocationLevelSelect;
