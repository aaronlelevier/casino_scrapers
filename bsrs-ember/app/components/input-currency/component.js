import Ember from 'ember';

export default Ember.Component.extend({
  currency: Ember.inject.service(),
  simpleStore: Ember.inject.service(),
  classNames: ['input-currency t-input-currency'],
  currencyObject: Ember.computed('model.auth_currency', 'model.cost_currency', function() {
    let store = this.get('simpleStore');
    let currencyField = this.get('currencyField');
    let inheritsFrom = this.get('inheritsFrom');
    let currency_service = this.get('currency');

    if (this.get(`model.${currencyField}`)) {
      return store.find('currency', this.get(`model.${currencyField}`));
    } else if (inheritsFrom) {
      return currency_service.getCurrency();
    } else if (this.get('model.new')) {
      return currency_service.getDefaultCurrency();
    }
  }),
  currencyObjects: Ember.computed(function() {
    let currency_service = this.get('currency');
    let person = this.get('model');
    return currency_service.getCurrencies();
  }),
  initialize: Ember.on('init', function() {
    let field = this.get('field');
    Ember.Binding.from('model.' + field).to('bound_field').connect(this);
  }),
  defaultNewAmount: Ember.computed(function() {
    let model = this.get('model');
    if (this.get('model.new')) {
      let currency_service = this.get('currency');
      let currency = currency_service.getDefaultCurrency();
      return parseFloat('0.0000').toFixed(currency.get('decimal_digits'));
    }
  }),
  actions: {
    format_currency() {
      let field = this.get('field');
      let currency_service = this.get('currency');
      let store = this.get('simpleStore');
      let precision = this.get('model.auth_currency') ? store.find('currency', this.get('model.auth_currency')).get('decimal_digits') : 4;
      this.set('model.' + field, currency_service.format_currency(this.get('bound_field'), precision));
    },
    selected(obj) {
      let model = this.get('model');
      let currencyField = this.get('currencyField');
      model.set(currencyField, obj.get('id'));
    }
  }
});