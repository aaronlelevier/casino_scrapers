import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'button',
  classNames: ['btn', 'btn-default'],
  classNameBindings: ['classSetter'],
  classSetter: Ember.computed(function() {
    return 't-' + this.get('type') + '-btn';
  }),
  actionSetter: Ember.computed(function() {
    return this.get('type');
  }),
  click() {
    // seond the type up to the base component, which also uses sendAction
  	this.sendAction(this.get('actionSetter'));
    return false;
  }
});
