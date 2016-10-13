import Ember from 'ember';
const { get, set } = Ember;

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
    let store = get(this, 'simpleStore');
    let currencyField = get(this, 'currencyField');
    let inheritsFrom = get(this, 'inheritsFrom');
    let currency_service = get(this, 'currency');
    if (get(this, `model.${currencyField}`)) {
      return store.find('currency', get(this, `model.${currencyField}`));
    } else if (inheritsFrom) {
      return currency_service.getPersonCurrency();
    }
    return currency_service.getDefaultCurrency();
  }),
  /* @method currencyObjects
   * power select dropdown list of currencies
  */
  currencyObjects: Ember.computed(function() {
    let currency_service = get(this, 'currency');
    return currency_service.getCurrencies();
  }),
  init() {
    this._super(...arguments);
    const field = get(this, 'field');
    Ember.defineProperty(this, 'bound_field', Ember.computed('model.' + field, function() {
      const currency_service = get(this, 'currency');
      // get currency from store based on currencyField API ('auth_currency')
      const precision = get(this, 'currencyObject').get('decimal_digits');
      // 'field' is the actual Decimal Field on the backend ('auth_amount')
      return currency_service.format_currency(get(this, 'model').get(field), precision);
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
    const currency = get(this, 'currencyObject');
    const field = get(this, 'field');
    let amount = get(currency, `model.${field}`) ? get(currency, `model.${field}`) : 0;
    return parseFloat(amount).toFixed(get(currency, 'decimal_digits'));
  }),
  actions: {
    format_currency() {
      const field = get(this, 'field');
      const currency_service = get(this, 'currency');
      const precision = get(this, 'currencyObject').get('decimal_digits');
      set(this, 'model.' + field, currency_service.format_currency(get(this, 'bound_field'), precision));
    },
    selected(obj) {
      const model = get(this, 'model');
      const currencyField = get(this, 'currencyField');
      model.set(currencyField, get(obj, 'id'));
    }
  }
});
