import Ember from 'ember';
const { run } = Ember;
import PromiseMixin from 'ember-promise/mixins/promise';
import formatNumber from 'accounting/format-number';
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
  currency: Ember.inject.service(),
  findWorkOrderCategory(search) {
    return PromiseMixin.xhr(`${CATEGORIES_URL}?children__isnull=true&name__icontains=${search}`, 'GET').then(response => response.results);
  },
  findWorkOrderProvider(search, category_id) {
    return PromiseMixin.xhr(`${PROVIDER_URL}?categories=${category_id}&name__icontains=${search}`, 'GET').then(response => response.results);
  },
  createWorkOrder(leaf_category, ticket_id) {
    const pk = this.get('uuid').v4();
    const d = new Date();
    const scheduled_date = d.setDate(d.getDate() + 5);
    const currency_object = this.get('currency').getDefaultCurrency();
    const work_order = this.get('simpleStore').push('work-order', { id: pk, ticket: ticket_id, cost_estimate_currency: currency_object.get('id'), 
      approved_amount: formatNumber(leaf_category.get('cost_amount_or_inherited'), { precision: currency_object.get('decimal_digits')}), scheduled_date: new Date(scheduled_date) });
    this.get('simpleStore').push('category', { id: leaf_category.get('id'), workOrders: [pk] });
    return work_order;
  },
  dispatchWorkOrder(work_order) {
    return PromiseMixin.xhr(this.get('url'), 'POST', {data: JSON.stringify(work_order.postSerialize())}).then((wo) => {
      return this.get('deserializer').deserialize(wo, wo.id);
    });
  }
});
