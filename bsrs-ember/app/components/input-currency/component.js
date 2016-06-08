import Ember from 'ember';

export default Ember.Component.extend({
  currency: Ember.inject.service(),
  simpleStore: Ember.inject.service(),
  classNames: ['input-currency t-input-currency'],
  currencyObject: Ember.computed('model.auth_currency', 'model.cost_currency', function() {
    let store = this.get('simpleStore');
    let currencyField = this.get('currencyField');
    let inheritsFrom = this.get('inheritsFrom');
    if (this.get(`model.${currencyField}`)) {
      return store.find('currency', this.get(`model.${currencyField}`));
    } else if (inheritsFrom) {
      let currency_service = this.get('currency');
      return currency_service.getCurrency();
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
  actions: {
    format_currency() {
      let field = this.get('field');
      let currency_service = this.get('currency');
      this.set('model.' + field, currency_service.format_currency(this.get('bound_field'), 'decimal_digits', 'USD'));
    },
    selected(obj) {
      let model = this.get('model');
      let currencyField = this.get('currencyField');
      model.set(currencyField, obj.get('id'));
    }
  }
});