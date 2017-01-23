import Ember from 'ember';
const { run } = Ember;
import PromiseMixin from 'ember-promise/mixins/promise';
import injectDeserializer from 'bsrs-ember/utilities/deserializer';
import injectUUID from 'bsrs-ember/utilities/uuid';
import FindByIdMixin from 'bsrs-ember/mixins/repositories/findById';
import CRUDMixin from 'bsrs-ember/mixins/repositories/crud';
import GridRepositoryMixin from 'bsrs-ember/mixins/repositories/grid';
import BASEURLS, { WORK_ORDER_URL, CATEGORIES_URL, PROVIDER_URL } from 'bsrs-ember/utilities/urls';

export default Ember.Object.extend(GridRepositoryMixin, FindByIdMixin, CRUDMixin, {
  type: 'work-order',
  typeGrid: 'work-order-list',
  garbage_collection: ['work-order-list'],
  uuid: injectUUID('uuid'),
  WDeserializer: injectDeserializer('work-order'),
  url: WORK_ORDER_URL,
  deserializer: Ember.computed.alias('WDeserializer'),
  findWorkOrderCategory(search) {
    return PromiseMixin.xhr(`${CATEGORIES_URL}?children__isnull=true&name__icontains=${search}`, 'GET').then(response => response.results);
  },
  findWorkOrderProvider(search, category_id) {
    return PromiseMixin.xhr(`${PROVIDER_URL}?categories=${category_id}&name__icontains=${search}`, 'GET').then(response => response.results);
  },
  createWorkOrder(leaf_category_id) {
    const pk = this.get('uuid').v4();
    const work_order = this.get('simpleStore').push('work-order', { id: pk });
    this.get('simpleStore').push('category', { id: leaf_category_id, workOrders: [pk] });
    // work_order.change_category({id: leaf_category.get('id')});
    return work_order;
  },
  dispatchWorkOrder(work_order) {
    return PromiseMixin.xhr(this.get('url'), 'POST', {data: JSON.stringify(work_order.serialize())}).then((wo) => {
      // not utilizing this yet
      return wo;
    });
  }
});
