import Ember from 'ember';

export default Ember.Component.extend({
  actions: {
    closeTabMaster(tab, action){
      this.sendAction('closeTabMaster', tab, action);
    }
  }
});
