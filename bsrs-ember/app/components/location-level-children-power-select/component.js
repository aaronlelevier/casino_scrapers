import Ember from 'ember';

var LocationLevelChildrenSelect = Ember.Component.extend({
  simpleStore: Ember.inject.service(),
  options: Ember.computed(function() {
    return this.get('simpleStore').find('location-level').filter((llevel) => llevel.get('id') !== this.get('model').get('id'));
  }),
  actions: {
    selected(new_children) {
      const model = this.get('model');
      model.set_children(new_children);
    }
  }
});

export default LocationLevelChildrenSelect;
