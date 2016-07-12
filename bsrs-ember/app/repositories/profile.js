import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';
import injectDeserializer from 'bsrs-ember/utilities/deserializer';
import injectUUID from 'bsrs-ember/utilities/uuid';
import BaseRepository from 'bsrs-ember/repositories/base-repo';

const { run } = Ember;
var PREFIX = config.APP.NAMESPACE;
var API_URL = `${PREFIX}/admin/profiles/`;

export default BaseRepository.extend({
  type: 'profile',
  typeGrid: 'profile-list',
  garbage_collection: Ember.computed(function() {
    return ['profile-list'];
  }),
  uuid: injectUUID('uuid'),
  profileDeserializer: injectDeserializer('profile'),
  url: API_URL,
  deserializer: Ember.computed.alias('profileDeserializer'),
  update(model) {
    let id = model.get('id');
    return PromiseMixin.xhr(`${API_URL}${id}/`, 'PUT', {
      data: JSON.stringify(model.serialize())
    }).then(() => {
      model.save();
      model.saveRelated();
    });
  },
});