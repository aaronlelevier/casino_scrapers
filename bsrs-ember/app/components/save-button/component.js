import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'button',
  classNames: ['btn', 'btn-default', 'save', 't-save-btn'],
  click(){
    this.sendAction('save');
    return false;
  }
});
