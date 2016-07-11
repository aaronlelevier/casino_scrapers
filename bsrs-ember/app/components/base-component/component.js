import Ember from 'ember';

var BaseComponent = Ember.Component.extend({
  tagName: 'header',
  actions: {
    save() {
      this.sendAction('save');
    },
    cancel() {
      this.sendAction('cancel');
    },
    delete() {
      this.sendAction('delete');
    },
  }
});

export default BaseComponent;
