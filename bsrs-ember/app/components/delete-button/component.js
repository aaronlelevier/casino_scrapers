import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'button',
  classNames: ['btn', 'btn-default', 'delete'],  
  click: function(){
    this.sendAction('delete');
    return false;
  }
});
