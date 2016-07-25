import Ember from 'ember';
import PromiseMixin from 'ember-promise/mixins/promise';
import inject from 'bsrs-ember/utilities/deserializer';
import injectUUID from 'bsrs-ember/utilities/uuid';
import GridRepositoryMixin from 'bsrs-ember/mixins/repositories/grid';
import CRUDMixin from 'bsrs-ember/mixins/repositories/crud';
import FindByIdMixin from 'bsrs-ember/mixins/repositories/findById';
import { LOCATION_LEVELS_URL } from 'bsrs-ember/utilities/urls';

var LocationLevelRepo = Ember.Object.extend(GridRepositoryMixin, FindByIdMixin, CRUDMixin, {
  type: 'location-level',
  typeGrid: 'location-level-list',
  garbage_collection: ['location-level-list'],
  url: LOCATION_LEVELS_URL,
  uuid: injectUUID('uuid'),
  LocationLevelDeserializer: inject('location-level'),
  deserializer: Ember.computed.alias('LocationLevelDeserializer'),
  peek(filter, computed_keys) {
    return this.get('simpleStore').find('location-level', filter);
  },
});

export default LocationLevelRepo;
