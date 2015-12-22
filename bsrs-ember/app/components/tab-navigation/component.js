import Ember from 'ember';

export default Ember.Component.extend({
  actions: {
    close(tab){
      this.attrs.close(tab);
    }
  }
});
