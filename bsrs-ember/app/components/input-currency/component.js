import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['input-currency t-input-currency'],
  fieldNames: 'auth_amount',
  value: Ember.computed('model', {
    get(key){
      return this.get('model');
    },
    set(key, value){
      //TODO: Original value lost on first set
      var model = this.get('model');
      this.set('model', value);
      return this.get('model', value);
    }
  })
});
