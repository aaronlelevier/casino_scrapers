import Ember from 'ember';

export default Ember.Component.extend({
  actions: {
    closeTabMaster(id){
      this.sendAction('closeTabMaster', id)
    }
  }
});
