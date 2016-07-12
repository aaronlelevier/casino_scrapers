import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';
import inject from 'bsrs-ember/utilities/deserializer';
import injectUUID from 'bsrs-ember/utilities/uuid';
import BaseRepository from 'bsrs-ember/repositories/base-repo';

var PREFIX = config.APP.NAMESPACE;
var THIRD_PARTY_URL = PREFIX + '/admin/third-parties/';

var ThirdPartyRepo = BaseRepository.extend({
  type: Ember.computed(function() { return 'third-party'; }),
  typeGrid: Ember.computed(function() { return 'third-party-list'; }),
  garbage_collection: Ember.computed(function() { return ['third-party-list']; }),
  uuid: injectUUID('uuid'),
  url: Ember.computed(function() { return THIRD_PARTY_URL; }),
  ThirdPartyDeserializer: inject('third-party'),
  deserializer: Ember.computed.alias('ThirdPartyDeserializer'),
  update(model) {
    return PromiseMixin.xhr(THIRD_PARTY_URL + model.get('id') + '/', 'PUT', {data: JSON.stringify(model.serialize())}).then(() => {
      model.save();
      model.saveRelated();
    });
  },
});

export default ThirdPartyRepo;
