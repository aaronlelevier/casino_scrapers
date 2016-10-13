import Ember from 'ember';
const { run } = Ember;
import { attr, Model } from 'ember-cli-simple-store/model';
import { belongs_to } from 'bsrs-components/attr/belongs-to';
import { many_to_many } from 'bsrs-components/attr/many-to-many';
import { validator, buildValidations } from 'ember-cp-validations';
import OptConf from 'bsrs-ember/mixins/optconfigure/tenant';
import NewMixin from 'bsrs-ember/mixins/model/new';
import SaveAndRollbackRelatedMixin from 'bsrs-ember/mixins/model/save-and-rollback-related';

const Validations = buildValidations({
  company_name: [
    validator('presence', {
      presence: true,
      message: 'errors.tenant.company_name'
    }),
    validator('length', {
      min: 5,
      max: 500,
      message: 'errors.tenant.company_name.min_max'
    })
  ],
  company_code: validator('presence', {
    presence: true,
    message: 'errors.tenant.company_code'
  }),
  dashboard_text: validator('presence', {
    presence: true,
    message: 'errors.tenant.dashboard_text'
  }),
  default_currency: validator('presence', {
    presence: true,
    message: 'errors.tenant.default_currency'
  }),
  countries: validator('length', {
    min: 1,
    message: 'errors.tenant.countries'
  }),
  billing_contact: validator('presence', {
    presence: true,
    message: 'errors.tenant.billing_contact'
  }),
  implementation_contact_initial: validator('presence', {
    presence: true,
    message: 'errors.tenant.implementation_contact_initial'
  }),
  implementation_email: [
    validator('presence', {
      presence: true,
      message: 'errors.tenant.implementation_email'
    }),
    validator('belongs-to'),
  ],
  billing_phone_number: [
    validator('presence', {
      presence: true,
      message: 'errors.tenant.billing_phone_number'
    }),
    validator('belongs-to'),
  ],
  billing_email: [
    validator('presence', {
      presence: true,
      message: 'errors.tenant.billing_email'
    }),
    validator('belongs-to'),
  ],
  billing_address: [
    validator('presence', {
      presence: true,
      message: 'errors.tenant.billing_address'
    }),
    validator('belongs-to'),
  ],
});

export default Model.extend(OptConf, Validations, SaveAndRollbackRelatedMixin, {
  init() {
    this._super(...arguments);
    belongs_to.bind(this)('default_currency', 'tenant');
    belongs_to.bind(this)('billing_phone_number', 'tenant', {dirty: false, track_related_model: true});
    belongs_to.bind(this)('billing_email', 'tenant', {dirty: false, track_related_model: true});
    belongs_to.bind(this)('billing_address', 'tenant', {dirty: false, track_related_model: true});
    belongs_to.bind(this)('implementation_email', 'tenant', {dirty: false, track_related_model: true});
    belongs_to.bind(this)('implementation_contact', 'tenant');
    belongs_to.bind(this)('dtd_start', 'tenant');
    many_to_many.bind(this)('country', 'tenant', {plural:true});
  },
  simpleStore: Ember.inject.service(),
  company_name: attr(''),
  company_code: attr(''),
  dashboard_text: attr(''),
  implementation_contact_initial: attr(''),
  billing_contact: attr(''),
  test_mode: attr(''),
  billing_phone_number_fk: undefined,
  billing_email_fk: undefined,
  billing_address_fk: undefined,
  implementation_contact_fk: undefined,
  tenant_countries_fks: [],
  isDirtyOrRelatedDirty: Ember.computed('isDirty', 'defaultCurrencyIsDirty', 'countriesIsDirty', 'billingEmailIsDirty', 'billingPhoneNumberIsDirty', 'implementationEmailIsDirty', 'implementationContactIsDirty', 'billingAddressIsDirty', 'dtdStartIsDirty', function() {
    return this.get('isDirty') || this.get('defaultCurrencyIsDirty') || this.get('countriesIsDirty') || this.get('billingEmailIsDirty') || this.get('billingPhoneNumberIsDirty') || this.get('implementationEmailIsDirty') || this.get('implementationContactIsDirty') || this.get('billingAddressIsDirty') || this.get('dtdStartIsDirty');
  }),
  isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
  remove_implementation_contact(id) {
    const store = this.get('simpleStore');
    let contactsArr = store.find('person', id).get('tenants_implementation_contact');
    contactsArr.splice(contactsArr.indexOf(this.get('id')), 1);
    run(() => {
      store.push('person', {id:this.get('id'), tenants_implementation_contact: contactsArr});
    });
  },
  rollback() {
    this.rollbackDefaultCurrency();
    this.rollbackCountries();
    this.rollbackImplementationEmail();
    this.rollbackImplementationContact();
    this.rollbackBillingEmail();
    this.rollbackBillingPhoneNumber();
    this.rollbackBillingAddress();
    this.rollbackDtdStart();
    this._super(...arguments);
  },
  saveRelated() {
    this.saveDefaultCurrency();
    this.saveCountries();
    this.saveRelatedSingle('implementation_email');
    this.saveImplementationEmail();
    this.saveImplementationContact();
    this.saveRelatedSingle('billing_address');
    this.saveBillingAddress();
    this.saveRelatedSingle('billing_email');
    this.saveBillingEmail();
    this.saveRelatedSingle('billing_phone_number');
    this.saveBillingPhoneNumber();
    this.saveDtdStart();
  },
  removeRecord() {
    run(() => {
      this.get('simpleStore').remove('tenant', this.get('id'));
    });
  },
  serialize() {
    let data = {
      id: this.get('id'),
      company_name: this.get('company_name'),
      company_code: this.get('company_code'),
      dashboard_text: this.get('dashboard_text'),
      default_currency: this.get('default_currency').get('id'),
      countries: this.get('countries_ids'),
      implementation_contact_initial: this.get('implementation_contact_initial'),
      billing_contact: this.get('billing_contact'),
      billing_phone_number: this.get('billing_phone_number').serialize(),
      billing_email: this.get('billing_email').serialize(),
      implementation_email: this.get('implementation_email').serialize(),
      billing_address: this.get('billing_address').serialize(),
    };
    if (!this.get('new')) {
      data.test_mode = this.get('test_mode');
      data.implementation_contact = this.get('implementation_contact.id');
      data.dtd_start = this.get('dtd_start.id');
    }
    return data;
  },
});
