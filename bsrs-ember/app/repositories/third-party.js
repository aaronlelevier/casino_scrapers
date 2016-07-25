import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';
import inject from 'bsrs-ember/utilities/deserializer';
import injectUUID from 'bsrs-ember/utilities/uuid';
import GridRepositoryMixin from 'bsrs-ember/mixins/repositories/grid';
import FindByIdMixin from 'bsrs-ember/mixins/repositories/findById';
import CRUDMixin from 'bsrs-ember/mixins/repositories/crud';
import { THIRD_PARTIES_URL } from 'bsrs-ember/utilities/urls';

var ThirdPartyRepo = Ember.Object.extend(GridRepositoryMixin, FindByIdMixin, CRUDMixin, {
  type: 'third-party',
  typeGrid: 'third-party-list',
  garbage_collection: Ember.computed(function() { return ['third-party-list']; }),
  uuid: injectUUID('uuid'),
  url: THIRD_PARTIES_URL,
  ThirdPartyDeserializer: inject('third-party'),
  deserializer: Ember.computed.alias('ThirdPartyDeserializer'),
});

export default ThirdPartyRepo;
