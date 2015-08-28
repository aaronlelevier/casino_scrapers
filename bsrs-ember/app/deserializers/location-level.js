import Ember from 'ember';

let check_children = (loc_level) => {
    //in memory closure reference for returned anonymous function
    let children = loc_level.get('children');
    return (compare_location_level) => {
        children.forEach((child) => {
            if (!compare_location_level.get('parent_id') && compare_location_level.get('id') === child.id) {
                compare_location_level.set('parent_id', loc_level.get('id'));
            }
        });
    };
};

var LocationLevelDeserializer = Ember.Object.extend({
    deserialize(response, options) {
        if (typeof options === 'undefined') {
            this.deserialize_list(response);
        } else {
            this.deserialize_single(response, options);
        }
    },
    deserialize_single(response, id) {
        let store = this.get('store');
        let location_level = store.push('location-level', response);
        let location_levels = store.find('location-level');
        location_levels.forEach((compare_location_level) => {
            //evaluate reverse relationship by comparing current location level children with passed in children
            let evaluate_current_location_level_children = check_children(compare_location_level);
            if (location_level.get('id') !== compare_location_level.get('id')) {
                evaluate_current_location_level_children(location_level);
            }
            //evaluate passed in children vs other location levels
            let evaluate_children = check_children(location_level);
            if (compare_location_level.get('id') !== location_level.get('id')) {
                evaluate_children(compare_location_level);
            }
        });
    },
    deserialize_list(response) {
        let store = this.get('store');
        //array of functions with children memoory
        let children_memory_array = [];
        response.results.forEach((model) => {
            let loc_level = store.push('location-level', model);
            children_memory_array.push(check_children(loc_level));
        });
        let location_levels = store.find('location-level');
        //loop over children closures and check to see if location-level store objects are need a parent id
        children_memory_array.forEach((evaluate_children_func) => {
            location_levels.forEach((compare_location_level) => {
                evaluate_children_func(compare_location_level);
            });
        });
    }
});

export default LocationLevelDeserializer;


