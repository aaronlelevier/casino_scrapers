import Ember from 'ember';
import { SESSION_URL } from 'bsrs-ember/utilities/urls';

export default Ember.Service.extend({
  simpleStore: Ember.inject.service(),

  model: Ember.computed(function(){
    let store = this.get('simpleStore');
    return store.findOne('person-current');
  }).volatile(),

  permissions: Ember.computed(function() {
    let person = this.get('model');
    return person.get('permissions');
  }).volatile(),

  fetch() {
    return new Ember.RSVP.Promise((resolve, reject) => {
      Ember.$.get(SESSION_URL)
      .then( (data) => resolve(data) )
      .catch( (error) => reject(error) );
    });
  }
});
