import Ember from 'ember';
import EmberPowerSelect from 'ember-power-select/components/power-select';

export default EmberPowerSelect.extend({
  // You can even use computed properties to do other stuff, like apply i18n, that wouldn't be
  // possible with static configuration.
  renderInPlace: true,
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
