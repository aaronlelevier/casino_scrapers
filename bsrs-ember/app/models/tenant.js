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
  billing_contact: validator('presence', {
    presence: true,
    message: 'errors.tenant.billing_contact'
  }),
  implementation_contact: validator('presence', {
    presence: true,
    message: 'errors.tenant.implementation_contact'
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
    belongs_to.bind(this)('billing_phone_number', 'tenant', {dirty: false});
    belongs_to.bind(this)('billing_email', 'tenant', {dirty: false});
    belongs_to.bind(this)('billing_address', 'tenant', {dirty: false});
    belongs_to.bind(this)('implementation_email', 'tenant', {dirty: false});
    many_to_many.bind(this)('country', 'tenant', {plural:true});
  },
  simpleStore: Ember.inject.service(),
  company_name: attr(''),
  company_code: attr(''),
  dashboard_text: attr(''),
  implementation_contact: attr(''),
  billing_contact: attr(''),
  billing_phone_number_fk: '',
  billing_email_fk: '',
  billing_address_fk: '',
  tenant_countries_fks: [],
  billingAddressIsDirty: Ember.computed('billing_address.isDirtyOrRelatedDirty', function(){
    return this.get('billing_address.isDirtyOrRelatedDirty');
  }),
  billingAddressIsNotDirty: Ember.computed.not('billingAddressIsDirty'),
  billingPhoneNumberIsDirty: Ember.computed('billing_phone_number.isDirtyOrRelatedDirty', function(){
    return this.get('billing_phone_number.isDirtyOrRelatedDirty');
  }),
  billingPhoneNumberIsNotDirty: Ember.computed.not('billingPhoneNumberIsDirty'),
  billingEmailIsDirty: Ember.computed('billing_email.isDirtyOrRelatedDirty', function(){
    return this.get('billing_email.isDirtyOrRelatedDirty');
  }),
  billingEmailIsNotDirty: Ember.computed.not('billingEmailIsDirty'),
  implementationEmailIsDirty: Ember.computed('implementation_email.isDirtyOrRelatedDirty', function(){
    return this.get('implementation_email.isDirtyOrRelatedDirty');
  }),
  implementationEmailIsNotDirty: Ember.computed.not('implementationEmailIsDirty'),
  isDirtyOrRelatedDirty: Ember.computed('isDirty', 'defaultCurrencyIsDirty', 'countriesIsDirty', 'billingEmailIsDirty', 'billingPhoneNumberIsDirty', 'implementationEmailIsDirty', 'billingAddressIsDirty', function() {
    return this.get('isDirty') || this.get('defaultCurrencyIsDirty') || this.get('countriesIsDirty') || this.get('billingEmailIsDirty') || this.get('billingPhoneNumberIsDirty') || this.get('implementationEmailIsDirty') || this.get('billingAddressIsDirty');
  }),
  isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
  rollback() {
    this.rollbackDefaultCurrency();
    this.rollbackCountries();
    this.rollbackImplementationEmail();
    this.rollbackBillingEmail();
    this.rollbackBillingPhoneNumber();
    this.rollbackBillingAddress();
    this._super(...arguments);
  },
  saveRelated() {
    this.saveDefaultCurrency();
    this.saveCountries();
    this.saveRelatedSingle('implementation_email');
    this.saveImplementationEmail();
    this.saveRelatedSingle('billing_address');
    this.saveBillingAddress();
    this.saveRelatedSingle('billing_email');
    this.saveBillingEmail();
    this.saveRelatedSingle('billing_phone_number');
    this.saveBillingPhoneNumber();
  },
  removeRecord() {
    run(() => {
      this.get('simpleStore').remove('tenant', this.get('id'));
    });
  },
  serialize() {
    return {
      id: this.get('id'),
      company_name: this.get('company_name'),
      company_code: this.get('company_code'),
      dashboard_text: this.get('dashboard_text'),
      default_currency: this.get('default_currency').get('id'),
      countries: this.get('countries_ids'),
      implementation_contact: this.get('implementation_contact'),
      billing_contact: this.get('billing_contact'),
      billing_phone_number: this.get('billing_phone_number').serialize(),
      billing_email: this.get('billing_email').serialize(),
      implementation_email: this.get('implementation_email').serialize(),
      billing_address: this.get('billing_address').serialize(),
    };
  },
});
