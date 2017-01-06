import Ember from 'ember';
const { run } = Ember;
import injectDeserializer from 'bsrs-ember/utilities/deserializer';
import injectUUID from 'bsrs-ember/utilities/uuid';
import FindByIdMixin from 'bsrs-ember/mixins/repositories/findById';
import CRUDMixin from 'bsrs-ember/mixins/repositories/crud';
import GridRepositoryMixin from 'bsrs-ember/mixins/repositories/grid';
import BASEURLS, { WORK_ORDER_URL } from 'bsrs-ember/utilities/urls';

export default Ember.Object.extend(GridRepositoryMixin, FindByIdMixin, CRUDMixin, {
  type: 'work-order',
  typeGrid: 'work-order-list',
  garbage_collection: ['work-order-list'],
  uuid: injectUUID('uuid'),
  WDeserializer: injectDeserializer('work-order'),
  url: WORK_ORDER_URL,
  deserializer: Ember.computed.alias('WDeserializer'),
});
