import Ember from 'ember';

export default Ember.Component.extend({
  drawerOpen: false,
  actions: {
    closeTabMaster(tab, action){
      this.sendAction('closeTabMaster', tab, action);
    },
    //TODO: test
    closeDrawer() {
      this.set('drawerOpen', false);
    },
    toggleDrawer() {
      this.toggleProperty('drawerOpen');
    }
  }
});
