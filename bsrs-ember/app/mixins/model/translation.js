import Ember from 'ember';

var TranslationMixin = Ember.Mixin.create({
    i18n: Ember.inject.service(),
    translated_name: Ember.computed('name', function() {
        const name = this.get('name') || '';
        return name === '' ? name : this.get('i18n').t(name).toString();
    })
});

export default TranslationMixin;
