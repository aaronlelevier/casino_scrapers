import Ember from 'ember';

var TabList = Ember.Component.extend({
  actions: {
    closeTab(tab){
      this.attrs.closeTabMaster(tab, {action:'closeTab'});
    },
  }
});

export default TabList;
