import Ember from 'ember';

var LocationLevelController = Ember.Controller.extend({
  actions: {
    closeTab(tab, action) {
      this.send('closeTabMaster', tab, action);
    }
  }
});
export default LocationLevelController;


