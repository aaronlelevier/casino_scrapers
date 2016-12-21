import Ember from 'ember';
import { SESSION_URL } from 'bsrs-ember/utilities/urls';

export default Ember.Service.extend({
  simpleStore: Ember.inject.service(),

  model: Ember.computed(function(){
    let store = this.get('simpleStore');
    return store.findOne('person-current');
  }).volatile(),

  timezone: null,

  permissions: Ember.computed('model.permissions.[]', function() {
    return this.get('model').get('permissions');
  }),

  fetch() {
    return new Ember.RSVP.Promise((resolve, reject) => {
      Ember.$.get(SESSION_URL)
      .then( (data) => resolve(data) )
      .catch( (error) => reject(error) );
    });
  }
});
