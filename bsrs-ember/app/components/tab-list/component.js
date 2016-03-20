import Ember from 'ember';

var TabList = Ember.Component.extend({
  actions: {
    closeTab(tab){
      //assumption: if single tab, and close tab, don't call transition callback which 'returns'
      if(tab.get('model_id')){
        tab.set('transitionCallback', undefined);
      }
      this.sendAction('closeTabMaster', tab);
    }
  }
});

export default TabList;
