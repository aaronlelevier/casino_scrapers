import Ember from 'ember';

var LocationLevelChildrenSelect = Ember.Component.extend({
    location_level_ids: Ember.computed(function() {
        return this.get('model').get('children');
    }).readOnly(),
    actions: {
        change(location_level) {
            let location_level_pk = location_level.get('id');
            let current_location_level = this.get('model');
            let children = current_location_level.get('children_fks') || [];
            if(Ember.$.inArray(location_level_pk, children) > -1) {
                let children_removed = children.filter((child) => {
                    return child !== location_level_pk;
                });
                current_location_level.set('children_fks', children_removed);
            } else {
                current_location_level.set('children_fks', children.concat([location_level_pk]));
            }
        }
    }
});

export default LocationLevelChildrenSelect;
