import Ember from 'ember';

var InputSettings = Ember.Component.extend({
    i18n: Ember.inject.service(),
    placeholder: Ember.computed('value', function() {
        var value = this.get('value');
        var inherited = this.get('inherited');
        var inherited_from = this.get('inherited_from');
        if (inherited) {
            return `Default ${inherited_from} Setting: ${value}`;
        }
        return this.get('i18n').t('admin.setting.company_name');
    }),
    current_value: Ember.computed('value', function() {
        var value = this.get('value');
        var inherited = this.get('inherited');
        var inherited_from = this.get('inherited_from');
        if (inherited) {
            // uses 'placeholder', so don't display a value
            return '';
        }
        if (!value){
            return this.get('i18n').t('admin.setting.company_name');
        }
        return value;
    })
});

export default InputSettings;