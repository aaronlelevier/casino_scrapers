import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'button',
  classNames: ['btn', 'btn-default', 't-cancel-btn'],
  click(){
  	this.sendAction('cancel');
    return false;
  }
});
