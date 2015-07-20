import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'a',
  click(){
    this.sendAction('delete');
    return false;
  }
});
