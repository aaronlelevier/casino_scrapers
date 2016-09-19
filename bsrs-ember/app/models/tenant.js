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
    many_to_many.bind(this)('country', 'tenant');
  },
  simpleStore: Ember.inject.service(),
  company_name: attr(''),
  isDirtyOrRelatedDirty: Ember.computed('isDirty', 'currencyIsDirty', 'countryIsDirty', function() {
    return this.get('isDirty') || this.get('currencyIsDirty') || this.get('countryIsDirty');
  }),
  isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
  rollback() {
    this.rollbackCurrency();
    this.rollbackCountry();
    this._super(...arguments);
  },
  saveRelated() {
    this.saveCurrency();
    this.saveCountry();
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
      country: this.get('country_ids'),
    };
  },
});
