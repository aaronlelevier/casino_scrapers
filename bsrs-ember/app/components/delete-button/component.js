import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'button',
  classNames: ['btn', 'btn-default', 'delete', 't-delete-btn'],
  click() {
    this.sendAction('delete');
    return false;
  }
});
