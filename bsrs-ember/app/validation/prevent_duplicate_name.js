import Ember from 'ember';

let prevent_duplicate_name = function(current_input_name) {
    if (Ember.$.inArray(current_input_name, this.get('available_location_level_names')) > -1 || !current_input_name)  {
        return false; 
    }
    return true;
};

export default prevent_duplicate_name;

