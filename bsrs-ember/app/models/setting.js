import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';

var SettingModel = Model.extend({
  i18n: Ember.inject.service(),
  // settings: start
  company_code: attr(''),
  company_name: attr(''),
  dashboard_text: attr(''),
  login_grace: attr(),
  tickets_module: attr(),
  work_orders_module: attr(),
  invoices_module: attr(),
  test_mode: attr(),
  test_contractor_email: attr(''),
  test_contractor_phone: attr(''),
  dt_start_id: attr(''),
  // settings: end
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
      name: this.get('name'),
      title: this.get('title'),
      settings: {
        company_code: this.get('company_code'),
        company_name: this.get('company_name'),
        dashboard_text: this.get('dashboard_text'),
        login_grace: parseInt(this.get('login_grace')),
        tickets_module: this.get('tickets_module'),
        work_orders_module: this.get('work_orders_module'),
        invoices_module: this.get('invoices_module'),
        test_mode: this.get('test_mode'),
        test_contractor_email: this.get('test_contractor_email'),
        test_contractor_phone: this.get('test_contractor_phone'),
        dt_start_id: this.get('dt_start_id'),
      }
    };
  }
});

export default SettingModel;