import Ember from 'ember';

export default Ember.Component.extend({
  tabList: Ember.inject.service(),
  actions: {
    closeTab(tab){
      this.sendAction('closeTabMaster', tab);
    }
  }
});
