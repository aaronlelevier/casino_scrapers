import Ember from 'ember';

export default Ember.TextField.extend({
  classNames: ['t-new-entry form-control'],
  value: Ember.computed('obj', {
    get(key){
      var prop = this.get('prop');
      return this.get('obj.' + prop);
    },
    set(key, value){
      //TODO: Original value lost on first set
      var prop = this.get('prop');
      this.set('obj.' + prop, value);
      return this.get('obj.' + prop, value);
    }
  })
});
