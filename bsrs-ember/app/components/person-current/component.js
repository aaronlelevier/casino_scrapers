import Ember from 'ember';
import PromiseMixin from 'ember-promise/mixins/promise';
import windowProxy from 'bsrs-ember/utilities/window-proxy';
import config from 'bsrs-ember/config/environment';

export default Ember.Component.extend({
  tagName: 'li',
  classNames: ['current-user t-current-user'],
  personCurrent: Ember.inject.service(),
  init() {

    var service = this.get('personCurrent');

    var person = service.get('model');
    var first_name = person.get('first_name');
    var last_name = person.get('last_name');
    var person_id = person.get('id');

    var name =`${first_name} ${last_name}`;
    this.set('full_name', name);
    this.set('person_id', person_id);
    this._super();

  },
  actions: {
    logout() {
      PromiseMixin.xhr('/api-auth/logout/', 'GET').then(() => {
          windowProxy.changeLocation('/login');
      });
    }
  }
});
