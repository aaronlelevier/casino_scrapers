import Ember from 'ember';
const { run } = Ember;
import { attr, Model } from 'ember-cli-simple-store/model';
import { belongs_to } from 'bsrs-components/attr/belongs-to';
import { many_to_many } from 'bsrs-components/attr/many-to-many';
import { validator, buildValidations } from 'ember-cp-validations';
import OptConf from 'bsrs-ember/mixins/optconfigure/tenant';

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
  currency: [
    validator('presence', {
      presence: true,
      message: 'errors.tenant.currency'
    }),
  ],
});

export default Model.extend(OptConf, Validations, {
  init() {
    this._super(...arguments);
    belongs_to.bind(this)('currency', 'tenant');
    belongs_to.bind(this)('billing_phone', 'tenant');
    belongs_to.bind(this)('billing_email', 'tenant');
    belongs_to.bind(this)('billing_address', 'tenant');
    belongs_to.bind(this)('implementation_email', 'tenant');
    many_to_many.bind(this)('country', 'tenant', {plural:true});
  },
  simpleStore: Ember.inject.service(),
  company_name: attr(''),
  company_code: attr(''),
  dashboard_text: attr(''),
  implementation_contact: attr(''),
  billing_contact: attr(''),
  billing_phone: '',
  tenant_countries_fks: [],
  isDirtyOrRelatedDirty: Ember.computed('isDirty', 'currencyIsDirty', 'countriesIsDirty', 'billingEmailIsDirty', 'billingPhoneIsDirty', 'implementationEmailIsDirty', 'billingAddressIsDirty', function() {
    return this.get('isDirty') || this.get('currencyIsDirty') || this.get('countriesIsDirty') || this.get('billingEmailIsDirty') || this.get('billingPhoneIsDirty') || this.get('implementationEmailIsDirty') || this.get('billingAddressIsDirty');
  }),
  isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
  rollback() {
    this.rollbackCurrency();
    this.rollbackCountries();
    this._super(...arguments);
  },
  saveRelated() {
    this.saveCurrency();
    this.saveCountries();
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
      currency: this.get('currency').get('id'),
      countries: this.get('countries_ids'),
      billing_phone: this.get('billing_phone').serialize(),
      billing_email: this.get('billing_email').serialize(),
      implementation_email: this.get('implementation_email').serialize(),
      billing_address: this.get('billing_address').serialize(),
    };
  },
});
