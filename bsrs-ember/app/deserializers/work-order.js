import Ember from 'ember';
const { inject } = Ember;
import { belongs_to } from 'bsrs-components/repository/belongs-to';
import OptConf from 'bsrs-ember/mixins/optconfigure/work-order';

export default Ember.Object.extend(OptConf, {
  currency: inject.service(),
  init() {
    belongs_to.bind(this)('status');
    belongs_to.bind(this)('category');
    belongs_to.bind(this)('provider');
    belongs_to.bind(this)('approver');
  },
  deserialize(response, id) {
    return this._deserializeSingle(response);
  },
  _deserializeSingle(response) {
    const store = this.get('simpleStore');
    response.status_fk = response.status.id;
    response.category_fk = response.category.id;
    response.provider_fk = response.provider.id;
    response.approver_fk = response.approver.id;
    const status = response.status;
    delete response.status;
    const category = response.category;
    delete response.category;
    const provider = response.provider;
    delete response.provider;
    const approver = response.approver;
    delete response.approver;
    response.detail = true;
    let workOrder = store.push('work-order', response);
    this.setup_status(status, workOrder);
    this.setup_category(category, workOrder);
    this.setup_provider(provider, workOrder);
    this.setup_approver(approver, workOrder);
    workOrder.save();
    return workOrder;
  },
});
