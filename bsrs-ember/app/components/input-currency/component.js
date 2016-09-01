import Ember from 'ember';

export default Ember.Component.extend({
  currency: Ember.inject.service(),
  simpleStore: Ember.inject.service(),
  classNames: ['input-currency t-input-currency'],
  /* @method currencyObject
   * @param { string } currencyField - API e.g. "auth_currency"
   * @param { string } inheritsFrom - not req from API
   * model.currencyField is an FK to a currency object loaded on boot
  */
  currencyObject: Ember.computed('model.auth_currency', 'model.cost_currency', function() {
    let store = this.get('simpleStore');
    let currencyField = this.get('currencyField');
    let inheritsFrom = this.get('inheritsFrom');
    let currency_service = this.get('currency');
    if (this.get(`model.${currencyField}`)) {
      return store.find('currency', this.get(`model.${currencyField}`));
    } else if (inheritsFrom) {
      return currency_service.getPersonCurrency();
    }
    return currency_service.getDefaultCurrency();
  }),
  /* @method currencyObjects
   * power select dropdown list of currencies
  */
  currencyObjects: Ember.computed(function() {
    let currency_service = this.get('currency');
    return currency_service.getCurrencies();
  }),
  init() {
    this._super(...arguments);
    const field = this.get('field');
    Ember.defineProperty(this, 'bound_field', Ember.computed('model.' + field, function() {
      const currency_service = this.get('currency');
      // get currency from store based on currencyField API ('auth_currency')
      const precision = this.get('currencyObject').get('decimal_digits');
      // 'field' is the actual Decimal Field on the backend ('auth_amount')
      return currency_service.format_currency(this.get('model').get(field), precision);
    }));
  },
  // initialize: Ember.on('init', function() {
  //   const field = this.get('field');
  //   Ember.defineProperty(this, 'bound_field', Ember.computed('model.' + field, function() {
  //     let currency_service = this.get('currency');
  //     let precision = this.get('currencyObject').get('decimal_digits');
  //     return currency_service.format_currency(this.get('model').get(field), precision);
  //   }));
  // //   let field = this.get('field');
  // //   // Ember.Binding.from('model.' + field).to('bound_field').connect(this);
  // //   Ember.defineProperty(this, 'bound_field', Ember.computed('model.field', function() {
  // //     let precision = this.get('currencyObject').get('decimal_digits');
  // //     return field;
  // //   }));
  // }),
  // bound_field: Ember.computed.alias('model.field'),
  placeholderAmount: Ember.computed(function() {
    const currency = this.get('currencyObject');
    const field = this.get('field');
    let amount = currency.get(`model.${field}`) ? currency.get(`model.${field}`) : 0;
    return parseFloat(amount).toFixed(currency.get('decimal_digits'));
  }),
  actions: {
    format_currency() {
      const field = this.get('field');
      const currency_service = this.get('currency');
      const precision = this.get('currencyObject').get('decimal_digits');
      this.set('model.' + field, currency_service.format_currency(this.get('bound_field'), precision));
    },
    selected(obj) {
      const model = this.get('model');
      const currencyField = this.get('currencyField');
      model.set(currencyField, obj.get('id'));
    }
  }
});
