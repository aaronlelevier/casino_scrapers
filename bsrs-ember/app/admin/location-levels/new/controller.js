import Ember from 'ember';

var LocationLevelNewController = Ember.Controller.extend({
  actions: {
    setName(name) {
      const model = this.get('model');
      model.set('name', name);
    },
    setChild(new_children) {
      const model = this.get('model');
      model.set_children(new_children);
    }
  }
});

export default LocationLevelNewController;


