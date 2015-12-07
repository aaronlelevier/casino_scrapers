import Ember from 'ember';

var LocationLevelChildrenSelect = Ember.Component.extend({
    actions: {
        selected(new_children) {
            const model = this.get('model');
            model.setChildren(new_children);
        }
    }
});

export default LocationLevelChildrenSelect;
