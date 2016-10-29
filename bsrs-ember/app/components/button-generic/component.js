import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'button',
  classNames: ['btn', 'btn-default'],
  classNameBindings: ['classSetter'],
  attributeBindings: ['btnDisabled:disabled'],
  classSetter: Ember.computed(function() {
    return 't-' + this.get('type') + '-btn';
  }),
  actionSetter: Ember.computed(function() {
    return this.get('type');
  }),
  click() {
    // send the type up to the base component, which also uses sendAction
    // to send up to the single component where closure action is called
    this.sendAction(this.get('actionSetter'));
    return true;
  }
});
