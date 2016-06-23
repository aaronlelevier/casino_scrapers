import Ember from 'ember';

var ChangeBoolMixin = Ember.Mixin.create({
  actions: {
    changeBool(modelName, attr) {
      const store = this.get('simpleStore');
      let model = store.find(modelName, this.get('model.id'));
      model.toggleProperty(attr);
    }
  }
});

export default ChangeBoolMixin;