import Ember from 'ember';
import EmberPowerSelectMobile from 'ember-power-select-mobile/components/power-select-mobile';

export default EmberPowerSelectMobile.extend({
  i18n: Ember.inject.service(),
  loadingMessage: Ember.computed('i18n.locale', function() {
    return this.get('i18n').t('selects.loading');
  }),
  searchMessage: Ember.computed('i18n.locale', function() {
    return this.get('i18n').t('selects.searchMessage');
  }),
  searchPlaceholder: Ember.computed('i18n.locale', function() {
    return this.get('i18n').t('selects.searchPlaceholder');
  }),
  noMatchesMessage: Ember.computed('i18n.locale', function() {
    return this.get('i18n').t('selects.noMatchesMessage');
  }),
  placeholder: Ember.computed('i18n.locale', function() {
    return this.get('i18n').t('power.select.select');
  }),
});
