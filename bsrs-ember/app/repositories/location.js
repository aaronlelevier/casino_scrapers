import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';
import inject from 'bsrs-ember/utilities/deserializer';
import injectUUID from 'bsrs-ember/utilities/uuid';
import GridRepositoryMixin from 'bsrs-ember/mixins/components/grid/repository';

var PREFIX = config.APP.NAMESPACE;
var LOCATION_URL = PREFIX + '/admin/locations/';

var LocationRepo = Ember.Object.extend(GridRepositoryMixin, {
    type: Ember.computed(function() { return 'location'; }),
    url: Ember.computed(function() { return LOCATION_URL; }),
    uuid: injectUUID('uuid'),
    LocationDeserializer: inject('location'),
    deserializer: Ember.computed.alias('LocationDeserializer'),
    update(model) {
        return PromiseMixin.xhr(LOCATION_URL + model.get('id') + '/', 'PUT', {data: JSON.stringify(model.serialize())}).then(() => {
            model.save();
            model.saveRelated();
        });
    },
    findLocationChildren(id, llevel, search_criteria) {
        let url = `${LOCATION_URL}get-level-children/${id}/${llevel}/`;
        // search_criteria = search_criteria ? search_criteria.trim() : search_criteria;
        if (search_criteria) {
            url += `?name__icontains=${search_criteria}`;
        }
        return PromiseMixin.xhr(url, 'GET').then((response) => {
            return response.results.filter((location) => {
                const name = location.name;
                return name.toLowerCase().indexOf(search_criteria.toLowerCase()) > -1;
            });
        });
    },
    findLocationParents(llevel, search_criteria) {
        let url = `${LOCATION_URL}get-level-parents/${llevel}/`;
        // search_criteria = search_criteria ? search_criteria.trim() : search_criteria;
        if (search_criteria) {
            url += `?name__icontains=${search_criteria}`;
        }
        return PromiseMixin.xhr(url, 'GET').then((response) => {
            return response.results.filter((location) => {
                const name = location.name;
                return name.toLowerCase().indexOf(search_criteria.toLowerCase()) > -1;
            });
        });
    },
    findTicket(search_criteria) {
        let url = LOCATION_URL;
        search_criteria = search_criteria ? search_criteria.trim() : search_criteria;
        if (search_criteria) {
            url += `?name__icontains=${search_criteria}`;
            return PromiseMixin.xhr(url, 'GET').then((response) => {
                this.get('LocationDeserializer').deserialize(response);
                let filterFunc = function(location) {
                    let name = location.get('name');
                    return name.toLowerCase().indexOf(search_criteria.toLowerCase()) > -1 && !location.get('new');
                };
                return this.get('store').find('location', filterFunc);
            });
        }
        return Ember.A([]);
    },
    findLocationSelect(filter, search_criteria) {
        let url = this.format_url(filter);
        // search_criteria = search_criteria ? search_criteria.trim() : search_criteria;
        if (search_criteria) {
            url += `&name__icontains=${search_criteria}`;
        }
        return PromiseMixin.xhr(url, 'GET').then((response) => {
            return response.results.filter((location) => {
                const location_level_fk = location.location_level;
                return location_level_fk === filter.location_level;
            });
        });
    },
    find(filter) {
        PromiseMixin.xhr(this.format_url(filter), 'GET').then((response) => {
            this.get('LocationDeserializer').deserialize(response);
        });
        return this.get('store').find('location');
    },
    findById(id) {
        let model = this.get('store').find('location', id);
        model.id = id;
        PromiseMixin.xhr(LOCATION_URL + id + '/', 'GET').then((response) => {
            this.get('LocationDeserializer').deserialize(response, id);
        });
        return model;
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
