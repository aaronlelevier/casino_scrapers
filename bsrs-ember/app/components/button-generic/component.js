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
  	this.sendAction(this.get('actionSetter'));
    return false;
  }
});

