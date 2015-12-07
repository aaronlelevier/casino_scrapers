import Ember from 'ember';

var LocationLevelChildrenSelect = Ember.Component.extend({
    actions: {
        selected(new_children) {
            const model = this.get('model');
            model.set('children_fks', new_children.mapBy('id'));
        }
    }
});

export default LocationLevelChildrenSelect;
