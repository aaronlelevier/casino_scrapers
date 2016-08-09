import Ember from 'ember';

var LocationLevelController = Ember.Controller.extend({
  actions: {
    closeTab(tab, action) {
      this.send('closeTabMaster', tab, action);
    },
    setName(name) {
      // mutable
      const model = this.get('model');
      model.set('name', name);
    }
  }
});
export default LocationLevelController;


