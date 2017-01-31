import Ember from 'ember';
import { belongs_to } from 'bsrs-components/repository/belongs-to';
import OptConf from 'bsrs-ember/mixins/optconfigure/work-order';

export default Ember.Object.extend(OptConf, {
  init() {
    belongs_to.bind(this)('cost_estimate_currency');
    belongs_to.bind(this)('status');
    belongs_to.bind(this)('category');
    belongs_to.bind(this)('provider');
  },
  deserialize(response, id) {
    if (id) {
      return this._deserializeSingle(response);
    }
  },
  _deserializeSingle(response) {
    const store = this.get('simpleStore');
    response.cost_estimate_currency_fk = response.cost_estimate_currency.id;
    response.status_fk = response.status.id;
    response.category_fk = response.category.id;
    response.provider_fk = response.provider.id;
    const currency = response.cost_estimate_currency;
    delete response.cost_estimate_currency;
    const status = response.status;
    delete response.status;
    const category = response.category;
    delete response.category;
    const provider = response.provider;
    delete response.provider;
    response.detail = true;
    let workOrder = store.push('work-order', response);
    // setup cost_estimate_currency to type relationship
    this.setup_cost_estimate_currency(currency, workOrder);
    this.setup_status(status, workOrder);
    this.setup_category(category, workOrder);
    this.setup_provider(provider, workOrder);
    workOrder.save();
    return workOrder;
  },
});
