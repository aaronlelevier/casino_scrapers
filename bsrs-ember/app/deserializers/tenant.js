import Ember from 'ember';
import { belongs_to } from 'bsrs-components/repository/belongs-to';
import { many_to_many } from 'bsrs-components/repository/many-to-many';
import OptConf from 'bsrs-ember/mixins/optconfigure/tenant';
import ContactDeserializerMixin from 'bsrs-ember/mixins/deserializer/contact';

export default Ember.Object.extend(OptConf, ContactDeserializerMixin, {
  init() {
    this._super(...arguments);
    belongs_to.bind(this)('default_currency');
    belongs_to.bind(this)('billing_phone_number');
    belongs_to.bind(this)('billing_email');
    belongs_to.bind(this)('implementation_email');
    belongs_to.bind(this)('implementation_contact');
    belongs_to.bind(this)('billing_address');
    belongs_to.bind(this)('dtd_start');
    belongs_to.bind(this)('state');
    belongs_to.bind(this)('country');
    belongs_to.bind(this)('phone_number_type');
    belongs_to.bind(this)('email_type');
    belongs_to.bind(this)('address_type');
    many_to_many.bind(this)('countries', 'tenant');
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
    response.default_currency_fk = response.default_currency.id;
    response.billing_phone_number_fk = response.billing_phone_number.id;
    response.billing_email_fk = response.billing_email.id;
    response.implementation_email_fk = response.implementation_email.id;
    response.implementation_contact_fk = response.implementation_contact ? response.implementation_contact.id : undefined;
    response.billing_address_fk = response.billing_address.id;
    response.dtd_start_fk = response.dtd_start ? response.dtd_start.id : undefined;
    const currency = response.default_currency;
    const billing_phone_number = response.billing_phone_number;
    const billing_email = response.billing_email;
    const implementation_email = response.implementation_email;
    const implementation_contact = response.implementation_contact;
    const billing_address = response.billing_address;
    const dtd_start = response.dtd_start;
    const countries = response.countries;
    delete response.default_currency;
    delete response.billing_phone_number;
    delete response.billing_email;
    delete response.implementation_email;
    delete response.implementation_contact;
    delete response.billing_address;
    delete response.dtd_start;
    delete response.countries;

    // setup contact to type relationship
    this.extract_single_phonenumber(billing_phone_number);
    this.extract_single_email(billing_email);
    this.extract_single_email(implementation_email);
    this.extract_single_address(billing_address);
    response.detail = true;
    let tenant = store.push('tenant', response);
    this.setup_default_currency(currency, tenant);
    this.setup_billing_phone_number(billing_phone_number, tenant);
    this.setup_billing_email(billing_email, tenant);
    this.setup_implementation_email(implementation_email, tenant);
    this.setup_implementation_contact(implementation_contact, tenant);
    this.setup_billing_address(billing_address, tenant);
    this.setup_dtd_start(dtd_start, tenant);
    this.setup_countries(countries, tenant);
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
