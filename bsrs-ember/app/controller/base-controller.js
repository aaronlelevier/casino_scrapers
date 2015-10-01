import Ember from 'ember';
const { Route, inject } = Ember;

var BaseController = Ember.Controller.extend({
    actions: {
        tabManagement(tab){
            //passes this function down to components, and when called, calls TabRoute parentAction
            this.send('closeTabMaster', tab);            
        },
        deleteTabManagement(tab, model, repository) {
            this.send('deleteAndCloseTabMaster', tab, model, repository);            
        }
    }
});

export default BaseController;

