import Ember from 'ember';

var ChangeBoolMixin = Ember.Mixin.create({
  actions: {
    changeBool(modelName, attr) {
      const store = this.get('simpleStore');
      let setting = store.find(modelName, this.get('model.id'));
      setting.toggleProperty(attr);
    }
  }
});

export
default ChangeBoolMixin;