import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';
import inject from 'bsrs-ember/utilities/deserializer';

var PREFIX = config.APP.NAMESPACE;
var LOCATION_LEVEL_URL = PREFIX + '/admin/location_levels/';

export default Ember.Object.extend({
//    locationDeserializer: inject('location'),
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
    find() {
        PromiseMixin.xhr(LOCATION_LEVEL_URL, 'GET').then((response) => {
            response.results.forEach((location) => {
                this.get('store').push('location-level', location);
            });
            // this.get('locationLevelDeserializer').deserialize(response);
        });
        return this.get('store').find('location-level');
    },
    findById(id) {
        PromiseMixin.xhr(LOCATION_LEVEL_URL + id + '/', 'GET').then((response) => {
            this.get('store').push('location-level', response);
        });
        return this.get('store').find('location-level', id);
    },
    delete(id) {
        PromiseMixin.xhr(LOCATION_LEVEL_URL + id + '/', 'DELETE');
        this.get('store').remove('location-level', id);
    }
});

