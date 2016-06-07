import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'button',
  classNames: ['btn-add btn btn-default'],
  actions: {
    addInput() {
      //not working
      Ember.$('.input-multi').append(Ember.Handlebars.compile('{{input-field}}'));
    }
  }
});
