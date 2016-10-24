import Ember from 'ember';
const { run } = Ember;
import injectDeserializer from 'bsrs-ember/utilities/deserializer';
import injectUUID from 'bsrs-ember/utilities/uuid';
import FindByIdMixin from 'bsrs-ember/mixins/repositories/findById';
import CRUDMixin from 'bsrs-ember/mixins/repositories/crud';
import GridRepositoryMixin from 'bsrs-ember/mixins/repositories/grid';
import BASEURLS, { TENANT_URL } from 'bsrs-ember/utilities/urls';

export default Ember.Object.extend(GridRepositoryMixin, FindByIdMixin, CRUDMixin, {
  type: 'tenant',
  typeGrid: 'tenant-list',
  garbage_collection: ['tenant-list'],
  uuid: injectUUID('uuid'),
  TDeserializer: injectDeserializer('tenant'),
  url: TENANT_URL,
  deserializer: Ember.computed.alias('TDeserializer'),
});
