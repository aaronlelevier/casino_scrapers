import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';

var SettingModel = Model.extend({
    i18n: Ember.inject.service(),
    login_grace: attr(''),
    welcome_text: attr(''),
    company_name: attr(''),
    create_all: attr(''),
    translated_title: Ember.computed('title', function(){
        return this.get('title') ? this.get('i18n').t(this.get('title')) : '';
    }),
    isDirtyOrRelatedDirty: Ember.computed('isDirty', function() {
        return this.get('isDirty');
    }),
    isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
    rollbackRelated() {},
    serialize() {
        return {
            id: this.get('id'),
            name: this.get('name'),
            title: this.get('title'),
            login_grace: parseInt(this.get('login_grace')),
            welcome_text: this.get('welcome_text'),
            company_name: this.get('company_name'),
            create_all: this.get('create_all')
        };
    }
});

export default SettingModel;
