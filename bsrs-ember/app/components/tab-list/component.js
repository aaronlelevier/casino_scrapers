import Ember from 'ember';

var TabList = Ember.Component.extend({
  homeModalShowing: false,
  actions: {
    closeTab(tab){
      this.attrs.closeTabMaster(tab, {action:'closeTab'});
    },
    homeModalShowing() {
      this.toggleProperty('homeModalShowing');
    }
  }
});

export default TabList;
