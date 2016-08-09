import Ember from 'ember';

var LocationLevelNewController = Ember.Controller.extend({
  actions: {
    setName(name) {
      const model = this.get('model');
      model.set('name', name);
    }
  }
});

export default LocationLevelNewController;


