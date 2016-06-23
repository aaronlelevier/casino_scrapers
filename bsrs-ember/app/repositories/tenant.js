
import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';
import inject from 'bsrs-ember/utilities/deserializer';
import injectUUID from 'bsrs-ember/utilities/uuid';

const { run } = Ember;
var PREFIX = config.APP.NAMESPACE;
var SETTING_URL = `${PREFIX}/admin/tenant/`;

export default Ember.Object.extend({
  TenantDeserializer: inject('tenant'),
  deserializer: Ember.computed.alias('TenantDeserializer'),
  findById(id) {
    let store = this.get('simpleStore');
    let model = store.findOne('tenant');
    return PromiseMixin.xhr(`${SETTING_URL}${id}/`, 'GET').then((response) => {
      this.get('TenantDeserializer').deserialize(response, response.id);
      return store.find('tenant', response.id);
    });
  },
  update(model) {
    let id = model.get('id');
    return PromiseMixin.xhr(`${SETTING_URL}${id}/`, 'PUT', {
      data: JSON.stringify(model.serialize())
    }).then(() => {
      model.save();
    });
  },
});