import Ember from 'ember';

var LocationLevelController = Ember.Controller.extend({
  actions: {
    closeTab(tab, action) {
      this.send('closeTabMaster', tab, action);
    },
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
export default LocationLevelController;
