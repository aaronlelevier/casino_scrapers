import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';
import injectDeserializer from 'bsrs-ember/utilities/deserializer';
import injectUUID from 'bsrs-ember/utilities/uuid';
import FindByIdMixin from 'bsrs-ember/mixins/repositories/findById';
import CRUDMixin from 'bsrs-ember/mixins/repositories/crud';

const { run } = Ember;
var PREFIX = config.APP.NAMESPACE;
var API_URL = `${PREFIX}/profiles/assignment/`;

export default Ember.Object.extend(FindByIdMixin, CRUDMixin, {
  type: 'profile',
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
    });
  },
});