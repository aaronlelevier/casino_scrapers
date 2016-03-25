import Ember from 'ember';

var TabList = Ember.Component.extend({
  actions: {
    closeTab(tab){
      //assumption: if single tab, and close tab, don't call transition callback which 'returns'
      if(tab.get('model_id')){
        tab.set('transitionCB', undefined);
      }
      this.sendAction('closeTabMaster', tab, 'closeTab');
    }
  }
});

export default TabList;
