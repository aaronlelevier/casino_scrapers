import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'button',
  classNames: ['btn', 'btn-default', 'cancel'],
  click: function(e){
  	this.sendAction('cancel');
    return false;
  }
});
