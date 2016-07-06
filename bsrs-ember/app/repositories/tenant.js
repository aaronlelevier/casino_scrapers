import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';
import inject from 'bsrs-ember/utilities/deserializer';
import injectUUID from 'bsrs-ember/utilities/uuid';
import FindByIdMixin from 'bsrs-ember/mixins/repositories/findById';

const { run } = Ember;
var PREFIX = config.APP.NAMESPACE;
var SETTING_URL = `${PREFIX}/admin/tenant/`;

export default Ember.Object.extend(FindByIdMixin, {
  TenantDeserializer: inject('tenant'),
  url: SETTING_URL,
  deserializer: Ember.computed.alias('TenantDeserializer'),
  update(model) {
    let id = model.get('id');
    return PromiseMixin.xhr(`${SETTING_URL}${id}/`, 'PUT', {
      data: JSON.stringify(model.serialize())
    }).then(() => {
      model.save();
    });
  },
});