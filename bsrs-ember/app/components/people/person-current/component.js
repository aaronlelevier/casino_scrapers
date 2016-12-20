import Ember from 'ember';
import PromiseMixin from 'ember-promise/mixins/promise';
import inject from 'bsrs-ember/utilities/store';
import windowProxy from 'bsrs-ember/utilities/window-proxy';
import config from 'bsrs-ember/config/environment';

export default Ember.Component.extend({
  simpleStore: Ember.inject.service(),
  tagName: 'li',
  classNames: ['dropdown current-user t-current-user'],
  personCurrent: Ember.inject.service('person-current'),
  instance: Ember.computed(function(){
    return this.get('personCurrent').get('model');
  }).volatile(),
  actions: {
    logout() {
      Ember.$.get('/api-auth/logout/', function(data){
        windowProxy.changeLocation('/');
      });
    }
  }
});
