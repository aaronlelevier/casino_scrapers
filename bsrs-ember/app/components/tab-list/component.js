import Ember from 'ember';

var TabList = Ember.Component.extend({
  actions: {
    closeTab(tab){
      this.sendAction('closeTabMaster', tab);
    }
  }
});

export default TabList;
