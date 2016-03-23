import Ember from 'ember';
const { run } = Ember;
import inject from 'bsrs-ember/utilities/uuid';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';

var PREFIX = config.APP.NAMESPACE;
var FILTERSET_URL = PREFIX + '/admin/saved-searches/';

var FilterSetRepository = Ember.Object.extend({
  error: Ember.inject.service(),
  uuid: inject('uuid'),
  insert(query, path, name) {
    const pk = this.get('uuid').v4();
    const data = {id: pk, name: name, endpoint_name: path, endpoint_uri: query};
    return PromiseMixin.xhr(FILTERSET_URL, 'POST', {data: JSON.stringify(data)}).then((response) => {
      const store = this.get('store');
      run(() => {
        store.push('filterset', data);
      });
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
