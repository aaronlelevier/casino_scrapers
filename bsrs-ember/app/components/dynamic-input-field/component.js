import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'span',
  value: Ember.computed('obj', {
    get(key){
      var prop = this.get('prop');
      return this.get('obj.' + prop);
    },
    set(key, value){
      //TODO: Original value lost on first set
      // debugger;
      var prop = this.get('prop');
      this.set('obj.' + prop, value);
      return this.get('obj.' + prop, value);
    }
  })
});
