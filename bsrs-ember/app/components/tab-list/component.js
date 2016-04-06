import Ember from 'ember';

var TabList = Ember.Component.extend({
  actions: {
    closeTab(tab){
      //assumption: if single tab, and close tab, don't call transition callback which 'returns'
      if(tab.get('model_id')){
        const cb = tab.get('transitionCB')();
        tab.set('continueTransition', true);
      }
      this.sendAction('closeTabMaster', tab, 'closeTab');//3rd param: closeTabAction in app route
    }
  }
});

export default TabList;
