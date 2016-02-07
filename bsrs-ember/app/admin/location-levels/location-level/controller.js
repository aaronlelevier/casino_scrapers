import Ember from 'ember';

var LocationLevelController = Ember.Controller.extend({
    actions: {
        closeTab(tab) {
            this.send('closeTabMaster', tab);
        }
    }
});
export default LocationLevelController;


