import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'div',
  model: null,
  classNames: ['input-multi-address t-input-multi-address'],
  actions: {
    append: function(){
      var factory = this.container.lookupFactory('model:' + this.get('modelType'));
      this.get('model').pushObject(
        factory.create()
      );
    },
    delete: function(){
      this.get('model').removeObject(entry);
    }
  }//action
});
