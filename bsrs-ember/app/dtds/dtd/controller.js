import Ember from 'ember';

export default Ember.Controller.extend({
  actions: {
    refreshRoute() {
      this.get('target.router').refresh();
    }
  }
});
