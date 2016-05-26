import Ember from 'ember';

var PowerSelectActionComponent = Ember.Component.extend({
  displayName: 'name',
  actions: {
    //RIGHT NOW only can be used for dt updating requeset
    selected(obj) {
      //Curry action down to this component to call updateRequest in field-element-display component
      const action = this.attrs.action;
      action(obj.get('text'), this.get('ticket'));
      this.set('selected', obj);
    }
  },
});

export default PowerSelectActionComponent;
