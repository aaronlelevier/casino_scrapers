import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'a',
  classNames: ['btn-delete', 't-delete-btn'],
  click() {
    this.sendAction('delete');
    return false;
  }
});
