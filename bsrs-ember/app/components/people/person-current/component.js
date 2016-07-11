import Ember from 'ember';
import PromiseMixin from 'ember-promise/mixins/promise';
import inject from 'bsrs-ember/utilities/store';
import injectService from 'ember-service/inject';
import windowProxy from 'bsrs-ember/utilities/window-proxy';
import config from 'bsrs-ember/config/environment';

export default Ember.Component.extend({
  simpleStore: injectService(),
  tagName: 'li',
  classNames: ['dropdown current-user t-current-user'],
  personCurrent: injectService(),
  instance: Ember.computed(function(){
    var service = this.get('personCurrent');
    return service.get('model');
  }),
  actions: {
    logout() {
      Ember.$.get('/api-auth/logout/', function(data){
        windowProxy.changeLocation('/');
      });
    }
  }
});
