import Ember from 'ember';

var PowerSelectActionComponent = Ember.Component.extend({
  displayName: 'name',
  actions: {
    selected(obj) {
      //RIGHT NOW only can be used for dt updating requeset
      const { action, label, ticket } = this.attrs.action;
      action(obj.get('text'), label, ticket);
      this.set('selected', obj);
    }
  },
});

export default PowerSelectActionComponent;
