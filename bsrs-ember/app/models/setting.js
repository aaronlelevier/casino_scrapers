import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';

var SettingModel = Model.extend({
    i18n: Ember.inject.service(),
    welcome_text: attr(),
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
            settings: {
                'login_grace': {
                    'required':true,
                    'type':'int',
                    'value':1
                },
                'welcome_text':{
                    'required':false,
                    'type':'str',
                    'value':this.get('welcome_text')
                },
                'company_name':{
                    'required':false,
                    'type':'str',
                    'value':'Andys Pianos'
                },
                'create_all':{
                    'required':true,
                    'type':'bool',
                    'value':true
                }
            }
        };
    }
});

export default SettingModel;
