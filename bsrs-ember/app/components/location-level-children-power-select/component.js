import Ember from 'ember';

var LocationLevelChildrenSelect = Ember.Component.extend({
  actions: {
    selected(new_children) {
      this.attrs.setChild(new_children)
    }
  }
});

export default LocationLevelChildrenSelect;
