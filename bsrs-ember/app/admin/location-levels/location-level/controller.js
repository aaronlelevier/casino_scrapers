import Ember from 'ember';

var LocationLevelController = Ember.Controller.extend({
    actions: {
        closeTab(tab, callback) {
            this.send('closeTabMaster', tab, callback);
        }
    }
});
export default LocationLevelController;


