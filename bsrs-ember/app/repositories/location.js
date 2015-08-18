import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';
import inject from 'bsrs-ember/utilities/deserializer';

var PREFIX = config.APP.NAMESPACE;
var LOCATION_URL = PREFIX + '/admin/locations/';

var LocationRepo = Ember.Object.extend({
    locationDeserializer: inject('location'),
    insert(model) {
        return PromiseMixin.xhr(LOCATION_URL, 'POST', {data: JSON.stringify(model.serialize())}).then(() => {
            model.save();
        });
    },
    update(model) {
        return PromiseMixin.xhr(LOCATION_URL + model.get('id') + '/', 'PUT', {data: JSON.stringify(model.serialize())}).then(() => {
            model.save();
        });
    },
    find() {
        PromiseMixin.xhr(LOCATION_URL, 'GET').then((response) => {
            this.get('locationDeserializer').deserialize(response);
        });
        return this.get('store').find('location');
    },
    findById(id) {
        PromiseMixin.xhr(LOCATION_URL + id + '/', 'GET').then((response) => {
            this.get('locationDeserializer').deserialize(response, id);
        });
        return this.get('store').find('location', id);
    },
    delete(id) {
        PromiseMixin.xhr(LOCATION_URL + id + '/', 'DELETE');
        this.get('store').remove('location', id);
    }
});

export default LocationRepo;
