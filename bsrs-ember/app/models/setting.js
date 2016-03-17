import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';

var SettingModel = Model.extend({
    i18n: Ember.inject.service(),
    company_name: attr(''),
    welcome_text: attr(''),
    login_grace: attr(''),
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
            settings: {
                company_name: this.get('company_name'),
                welcome_text: this.get('welcome_text'),
                login_grace: parseInt(this.get('login_grace'))
            }
        };
    }
});

export default SettingModel;
