import Ember from 'ember';

let prevent_duplicate_name = function(current_input_name) {
    if (Ember.$.inArray(current_input_name, this.get('available_location_level_names'))) {
        return false; 
    }
};

export default prevent_duplicate_name;

