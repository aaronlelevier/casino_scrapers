import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';
import inject from 'bsrs-ember/utilities/deserializer';

var PREFIX = config.APP.NAMESPACE;
var LOCATION_URL = PREFIX + '/admin/locations/';

var LocationRepo = Ember.Object.extend({
    LocationDeserializer: inject('location'),
    insert(model) {
        return PromiseMixin.xhr(LOCATION_URL, 'POST', {data: JSON.stringify(model.serialize())}).then(() => {
            model.save();
            model.saveRelated();
        });
    },
    update(model) {
        return PromiseMixin.xhr(LOCATION_URL + model.get('id') + '/', 'PUT', {data: JSON.stringify(model.serialize())}).then(() => {
            model.save();
            model.saveRelated();
        });
    },
    findLocationSelect(filter, search_criteria) {
        let url = this.format_url(filter);
        url += '&search=' + search_criteria;
        PromiseMixin.xhr(url, 'GET').then((response) => {
            this.get('LocationDeserializer').deserialize(response);
        });
        return this.get('store').find('location', {location_level_fk: filter.location_level});
    },
    find(filter) {
        PromiseMixin.xhr(this.format_url(filter), 'GET').then((response) => {
            this.get('LocationDeserializer').deserialize(response);
        });
        return this.get('store').find('location');
    },
    findWithQuery(page, sort, search, find) {
        page = page || 1;
        var endpoint = LOCATION_URL + '?page=' + page; //TODO: make url consistent in both repos
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
        var all = this.get('store').find('location');
        PromiseMixin.xhr(endpoint).then((response) => {
            all.set('isLoaded', true);
            all.set('count', response.count);
            this.get('LocationDeserializer').deserialize(response); //TODO: remove this ?
        });
        return all;
    },
    findById(id) {
        PromiseMixin.xhr(LOCATION_URL + id + '/', 'GET').then((response) => {
            this.get('LocationDeserializer').deserialize(response, id);
        });
        return this.get('store').find('location', id);
    },
    delete(id) {
        PromiseMixin.xhr(LOCATION_URL + id + '/', 'DELETE');
        this.get('store').remove('location', id);
    },
    format_url(filter) {
        let url = LOCATION_URL;
        if(typeof filter !== 'undefined') {
            let name = Object.keys(filter)[0];
            let value = filter[Object.keys(filter)[0]];
            url = url + '?' + name + '=' + value;
        }
        return url;
    }
});

export default LocationRepo;
