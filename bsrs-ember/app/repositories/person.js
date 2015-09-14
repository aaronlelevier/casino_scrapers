import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';
import inject from 'bsrs-ember/utilities/deserializer';

var PREFIX = config.APP.NAMESPACE;
var PEOPLE_URL = PREFIX + '/admin/people/';

export default Ember.Object.extend({
    PersonDeserializer: inject('person'),
    insert(model) {
        return PromiseMixin.xhr(PEOPLE_URL, 'POST', {data: JSON.stringify(model.createSerialize())}).then(() => {
            model.save();
            model.saveRelated();
        });
    },
    update(model) {
        return PromiseMixin.xhr(PEOPLE_URL + model.get('id') + '/', 'PUT', {data: JSON.stringify(model.serialize())}).then(() => {
            model.save();
            model.saveRelated();
        });
    },
    find() {
        PromiseMixin.xhr(PEOPLE_URL, 'GET').then((response) => {
            this.get('PersonDeserializer').deserialize(response);
        });
        return this.get('store').find('person');
    },
    findWithQuery(page, sort, search, find) {
        page = page || 1;
        var endpoint = PREFIX + '/admin/people/?page=' + page;
        if (sort && sort !== 'id') {
            endpoint = endpoint + '&ordering=' + sort;
        }
        if (search && search !== '') {
            endpoint = endpoint + '&search=' + encodeURIComponent(search);
        }
        if (find && find !== '') {
            let finds = find.split(',');
            finds.forEach(function(data) {
                let params = data.split(':');
                let key = params[0];
                let value = params[1];
                endpoint = endpoint + '&' + key + '__icontains=' + encodeURIComponent(value);
            });
        }
        var all = this.get('store').find('person');
        PromiseMixin.xhr(endpoint).then((response) => {
            all.set('count', response.count);
            this.get('PersonDeserializer').deserialize(response);
        });
        return all;
    },
    findById(id) {
        PromiseMixin.xhr(PEOPLE_URL + id + '/', 'GET').then((response) => {
            this.get('PersonDeserializer').deserialize(response, id);
        });
        return this.get('store').find('person', id);
    },
    delete(id) {
        PromiseMixin.xhr(PEOPLE_URL + id + '/', 'DELETE');
        this.get('store').remove('person', id);
    }
});
