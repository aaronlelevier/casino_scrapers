import Ember from 'ember';
import inject from 'bsrs-ember/utilities/store';

export default Ember.Service.extend({
  simpleStore: Ember.inject.service(),
  model: Ember.computed(function(){
    let store = this.get('simpleStore');
    return store.findOne('person-current');
  })
});
