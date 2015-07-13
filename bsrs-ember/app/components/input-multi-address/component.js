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
    },
    changeType: function(address, val) {
        Ember.run(function() {
            console.log("New Type: " + val);
            address.set("type.id", val);
        });
        this.get('target').send('changeType', val); //?? when is this used?
    },
    changeState: function(state, val) {
        Ember.run(function() {
            console.log("New State: " + val);
            state.set("state.id", val);
        });
        this.get('target').send('changeState', val); //?? when is this used?
    }
  }//action
});
