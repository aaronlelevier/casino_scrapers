import Ember from 'ember';
import inject from 'bsrs-ember/utilities/uuid';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';

var PREFIX = config.APP.NAMESPACE, run = Ember.run;
var FILTERSET_URL = PREFIX + '/admin/saved-searches/';

var FilterSetRepository = Ember.Object.extend({
    uuid: inject('uuid'),
    insert(url, path, name) {
        let store = this.get('store');
        let pk = this.get('uuid').v4();
        let query = url.slice(url.indexOf('?'));
        let data = {id: pk, name: name, endpoint_name: path, endpoint_uri: query};
        run(() => {
            store.push('filterset', data);
        });
        PromiseMixin.xhr(FILTERSET_URL, 'POST', {data: JSON.stringify(data)});
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
