import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';
import inject from 'bsrs-ember/utilities/deserializer';
import GridRepositoryMixin from 'bsrs-ember/mixins/components/grid/repository';

var PREFIX = config.APP.NAMESPACE;
var LOCATION_LEVEL_URL = PREFIX + '/admin/location-levels/';

var LocationLevelRepo = Ember.Object.extend(GridRepositoryMixin, {
    type: Ember.computed(function() { return 'location-level'; }),
    url: Ember.computed(function() { return LOCATION_LEVEL_URL; }),
    LocationLevelDeserializer: inject('location-level'),
    deserializer: Ember.computed.alias('LocationLevelDeserializer'),
    insert(model) {
        return PromiseMixin.xhr(LOCATION_LEVEL_URL, 'POST', {data: JSON.stringify(model.serialize())}).then(() => {
            model.save();
        });
    },
    update(model) {
        return PromiseMixin.xhr(LOCATION_LEVEL_URL + model.get('id') + '/', 'PUT', {data: JSON.stringify(model.serialize())}).then(() => {
            model.save();
        });
    },
    peek(filter, computed_keys) {
        return this.get('store').find('location-level', filter, computed_keys);
    },
    find() {
        PromiseMixin.xhr(LOCATION_LEVEL_URL, 'GET').then((response) => {
            this.get('LocationLevelDeserializer').deserialize(response);
        });
        return this.get('store').find('location-level');
    },
    findById(id) {
        let model = this.get('store').find('location-level', id);
        model.id = id;
        PromiseMixin.xhr(LOCATION_LEVEL_URL + id + '/', 'GET').then((response) => {
            this.get('LocationLevelDeserializer').deserialize(response, id);
        });
        return model;
    },
    delete(id) {
        PromiseMixin.xhr(LOCATION_LEVEL_URL + id + '/', 'DELETE');
        this.get('store').remove('location-level', id);
    }
});

export default LocationLevelRepo;
