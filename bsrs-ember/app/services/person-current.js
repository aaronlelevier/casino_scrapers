import Ember from 'ember';
import inject from 'bsrs-ember/utilities/store';

export default Ember.Service.extend({
  store: inject('main'),
  model: Ember.computed(function(){
    let store = this.get('store');
    return store.findOne('person-current');
  })
});
