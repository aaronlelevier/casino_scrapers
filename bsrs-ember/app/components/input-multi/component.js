import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'div',
  model: null,
  classNames: ['input-multi t-input-multi'],
  actions: {
    append: function() {
      var factory = this.container.lookupFactory('model:' + this.get('modelType'));
      this.get('model').pushObject(
        factory.create()
      );
    },//append
    delete: function(entry) {
      this.get('model').removeObject(entry);
    },//delete
  }//action



});
