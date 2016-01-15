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
    findLocationChildren(id, llevel_id, search_criteria) {
        let url = `${LOCATION_URL}${id}/get-level-children/${llevel_id}/`;
        // search_criteria = search_criteria ? search_criteria.trim() : search_criteria;
        if (search_criteria) {
            url += `?name__icontains=${search_criteria}`;
        }
        return PromiseMixin.xhr(url, 'GET').then((response) => {
            this.get('LocationDeserializer').deserialize(response);
            const filterFunc = function(location) {
                const name = location.get('name');
                return name.toLowerCase().indexOf(search_criteria.toLowerCase()) > -1 && !location.get('new');
            };
            return this.get('store').find('location', filterFunc);
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
        if (search_criteria) {
            url += `&name__icontains=${search_criteria}`;
        }
        return PromiseMixin.xhr(url, 'GET').then((response) => {
            this.get('LocationDeserializer').deserialize(response);
            let filterFunc = function(location) {
                let location_level_fk = location.get('location_level').get('id');
                return location_level_fk === filter.location_level;
            };
            //TODO: this will return those locations with a certain location level but doesn't include the search parameters
            return this.get('store').find('location', filterFunc);
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
