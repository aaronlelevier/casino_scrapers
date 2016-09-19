import Ember from 'ember';
import { belongs_to } from 'bsrs-components/repository/belongs-to';
import { many_to_many } from 'bsrs-components/repository/many-to-many';
import OptConf from 'bsrs-ember/mixins/optconfigure/tenant';

export default Ember.Object.extend(OptConf, {
  init() {
    this._super(...arguments);
    belongs_to.bind(this)('currency', 'tenant', 'currency');
    many_to_many.bind(this)('country', 'tenant');
  },
  deserialize(response, id) {
    if (id) {
      return this._deserializeSingle(response);
    } else {
      return this._deserializeList(response);
    }
  },
  _deserializeSingle(response) {
    const store = this.get('simpleStore');
    response.currency_fk = response.currency.id;
    const currency = response.currency;
    const country = response.country;
    delete response.currency;
    delete response.country;
    response.detail = true;
    let tenant = store.push('tenant', response);
    // TODO: (ayl) both these related models are optional, so need 'if' check n tests
    // use blocking if properties not required
    // if (currency) {
      this.setup_currency(currency, tenant);
    // }
    // if (countrys) {
      this.setup_country(country, tenant);
    // }
    tenant.save();
    return tenant;
  },
  _deserializeList(response) {
    const store = this.get('simpleStore');
    response.results.forEach((model) => {
      store.push('tenant-list', model);
    });
  }
});
