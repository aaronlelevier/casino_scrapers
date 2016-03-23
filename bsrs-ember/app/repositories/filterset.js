import Ember from 'ember';
import inject from 'bsrs-ember/utilities/uuid';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';

var PREFIX = config.APP.NAMESPACE, run = Ember.run;
var FILTERSET_URL = PREFIX + '/admin/saved-searches/';

var FilterSetRepository = Ember.Object.extend({
  error: Ember.inject.service(),
  uuid: inject('uuid'),
  insert(query, path, name) {
    let store = this.get('store');
    let pk = this.get('uuid').v4();
    let data = {id: pk, name: name, endpoint_name: path, endpoint_uri: query};
    run(() => {
      store.push('filterset', data);
    });
    //TODO: ERROR HANDLING
    PromiseMixin.xhr(FILTERSET_URL, 'POST', {data: JSON.stringify(data)}).then(() => {
      console.log('successful save filter');
    }, (xhr) => {
      if(xhr.status === 400){
        this.get('error').logErr('This name is already taken');
      }
    });
  },
  fetch() {
    let store = this.get('store');
    return store.find('filterset');
  },
  delete(id) {
    let store = this.get('store');
    PromiseMixin.xhr(FILTERSET_URL + id + '/', 'DELETE');
    run(() => {
      store.remove('filterset', id);
    });
  }
});

export default FilterSetRepository;
