import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'button',
  classNames: ['add-btn btn btn-default'],
  actions: {
    addInput() {
      //not working
      Ember.$('.input-multi').append(Ember.Handlebars.compile('{{input-field}}'));
    }
  }
});
