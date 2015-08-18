import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';
import inject from 'bsrs-ember/utilities/deserializer';

var PREFIX = config.APP.NAMESPACE;

export default Ember.Object.extend({
    PersonDeserializer: inject('person'),
    insert(model) {
        return PromiseMixin.xhr(PREFIX + '/admin/people/', 'POST', {data: JSON.stringify(model.createSerialize())}).then(() => {
            model.save();
            model.saveRelated();
        });
    },
    update(model) {
        return PromiseMixin.xhr(PREFIX + '/admin/people/' + model.get('id') + '/', 'PUT', {data: JSON.stringify(model.serialize())}).then(() => {
            model.save();
            model.saveRelated();
        });
    },
    find() {
        var all = this.get('store').find('person');
        PromiseMixin.xhr(PREFIX + '/admin/people/', 'GET').then((response) => {
            all.set('count', response.count);
            this.get('PersonDeserializer').deserialize(response);
        });
        return all;
    },
    findWithQuery(page, sort, search) {
        var endpoint = PREFIX + '/admin/people/?page=' + page;
        if (sort && sort !== 'id') {
            endpoint = endpoint + '&ordering=' + sort;
        }
        if (search && search !== '') {
            endpoint = endpoint + '&search=' + encodeURIComponent(search);
        }
        PromiseMixin.xhr(endpoint).then((response) => {
            this.get('PersonDeserializer').deserialize(response);
        });
        return this.get('store').find('person');
    },
    findById(id) {
        PromiseMixin.xhr(PREFIX + '/admin/people/' + id + '/', 'GET').then((response) => {
            this.get('PersonDeserializer').deserialize(response, id);
        });
        return this.get('store').find('person', id);
    },
    delete(id) {
        PromiseMixin.xhr(PREFIX + '/admin/people/' + id + '/', 'DELETE');
        this.get('store').remove('person', id);
    }
});
