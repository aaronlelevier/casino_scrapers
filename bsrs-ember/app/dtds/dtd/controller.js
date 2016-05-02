import Ember from 'ember';

export default Ember.Controller.extend({
  actions: {
    /* Prevent linkClick from being handled in dtd-preview that isn't functional */
    linkClick() {
      return false;
    }
  } 
});
