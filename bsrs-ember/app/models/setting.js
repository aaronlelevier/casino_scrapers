import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';

var SettingModel = Model.extend({
    i18n: Ember.inject.service(),
    // settings: start
    company_code: attr(''),
    company_name: attr(''),
    dashboard_text: attr(''),
    login_grace: attr(),
    exchange_rates: attr(),
    modules: attr(),
    test_mode: attr(),
    test_contractor_email: attr(''),
    test_contractor_phone: attr(''),
    dt_start_key: attr(''),
    // settings: end
    translated_title: Ember.computed(function(){
        return this.get('i18n').t('admin.general', { count: 2 });
    }),
    isDirtyOrRelatedDirty: Ember.computed('isDirty', function() {
        return this.get('isDirty');
    }),
    isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
    rollback() {},
    serialize() {
        return {
            id: this.get('id'),
            name: this.get('name'),
            title: this.get('title'),
            related_id: this.get('related_id'),
            settings: {
                company_code: this.get('company_code'),
                company_name: this.get('company_name'),
                dashboard_text: this.get('dashboard_text'),
                login_grace: parseInt(this.get('login_grace')),
                // TODO: how should a Float be formatted here?
                exchange_rates: parseFloat(this.get('exchange_rates'), 10).toFixed(4),
                // TODO: Needs to be a "power-select" multi
                // ternary for Array casting then needs to be removed
                modules: Array.isArray(this.get('modules')) === true ? this.get('modules') : [this.get('modules')],
                test_mode: this.get('test_mode'),
                test_contractor_email: this.get('test_contractor_email'),
                test_contractor_phone: this.get('test_contractor_phone'),
                dt_start_key: this.get('dt_start_key'),
            }
        };
    }
});

export default SettingModel;
