import Ember from 'ember';

export default Ember.Service.extend({
  simpleStore: Ember.inject.service(),
  model: Ember.computed(function(){
    let store = this.get('simpleStore');
    return store.findOne('person-current');
  })
});
