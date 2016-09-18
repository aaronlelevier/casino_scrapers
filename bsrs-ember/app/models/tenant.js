import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';
import inject from 'bsrs-ember/utilities/inject';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  company_name: validator('presence', {
    presence: true,
    message: 'errors.settings.company_name'
  }),
  company_code: validator('presence', {
    presence: true,
    message: 'errors.settings.company_code'
  }),
  dashboard_text: validator('presence', {
    presence: true,
    message: 'errors.settings.dashboard_text'
  }),
});

export default Model.extend(Validations, {
  repository: inject('tenant'),
  company_code: attr(''),
  company_name: attr(''),
  dashboard_text: attr(''),
  test_mode: attr(),
  dt_start_id: attr(''),
  default_currency_id: attr(''),
  i18n: Ember.inject.service(),
  translated_title: Ember.computed(function() {
    return this.get('i18n').t('admin.general', {
      count: 2
    });
  }),
  isDirtyOrRelatedDirty: Ember.computed('isDirty', function() {
    return this.get('isDirty');
  }),
  isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
  changeStartDtd(dtd) {
    this.set('dt_start_id', dtd.id);
    this.set('dt_start', {
      id: dtd.id,
      key: dtd.key
    });
  },
  serialize() {
    return {
      id: this.get('id'),
      company_code: this.get('company_code'),
      company_name: this.get('company_name'),
      dashboard_text: this.get('dashboard_text'),
      test_mode: this.get('test_mode'),
      dt_start: this.get('dt_start_id'),
      default_currency: this.get('default_currency_id')
    };
  }
});
