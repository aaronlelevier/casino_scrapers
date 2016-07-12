import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';
import inject from 'bsrs-ember/utilities/deserializer';
import injectUUID from 'bsrs-ember/utilities/uuid';
import BaseRepository from 'bsrs-ember/repositories/base-repo';

var PREFIX = config.APP.NAMESPACE;
var LOCATION_LEVEL_URL = PREFIX + '/admin/location-levels/';

var LocationLevelRepo = BaseRepository.extend({
  type: Ember.computed(function() { return 'location-level'; }),
  typeGrid: Ember.computed(function() { return 'location-level-list'; }),
  garbage_collection: Ember.computed(function() { return ['location-level-list']; }),
  url: Ember.computed(function() { return LOCATION_LEVEL_URL; }),
  uuid: injectUUID('uuid'),
  LocationLevelDeserializer: inject('location-level'),
  deserializer: Ember.computed.alias('LocationLevelDeserializer'),
  update(model) {
    return PromiseMixin.xhr(LOCATION_LEVEL_URL + model.get('id') + '/', 'PUT', {data: JSON.stringify(model.serialize())}).then(() => {
      model.save();
    });
  },
  peek(filter, computed_keys) {
    return this.get('simpleStore').find('location-level', filter);
  },
});

export default LocationLevelRepo;
