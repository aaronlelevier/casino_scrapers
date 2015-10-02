import Ember from 'ember';

var TabActionMixin = Ember.Mixin.create({
    actions: {
        tabActions(tab){
            this.send('closeTabMaster', tab);            
        },
        deleteTabAction(tab, repository) {
            this.send('deleteAndCloseTabMaster', tab, repository);            
        }
    }
});

export default TabActionMixin;
