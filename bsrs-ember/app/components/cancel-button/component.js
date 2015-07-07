import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'button',
  classNames: ['btn', 'btn-default', 't-cancel'],
  click: function(){
  	this.sendAction('cancel');
    return false;
  }
});
