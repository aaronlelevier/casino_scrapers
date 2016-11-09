import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
const { get, set, computed } = Ember;
import { task, timeout } from 'ember-concurrency';
import { ValidationComponentInit } from 'bsrs-ember/mixins/validation-component';

const TIMEOUT = config.APP.VALIDATION_TIMEOUT_INTERVAL;

export default Ember.Component.extend(ValidationComponentInit, {
  currency: Ember.inject.service(),
  simpleStore: Ember.inject.service(),
  classNames: ['input-currency t-input-currency'],
  /** 
     @method showMessage
     focusedOut will only highlight the input box with invalid color
   */
  showMessage: computed('focusedOut', function() {
    return this.get('focusedOut');
  }),
  /** 
     @method currencyObject
     @param { string } currencyField - API e.g. "auth_currency"
     @param { string } inheritsFrom - not req from API
     model.currencyField is an FK to a currency object loaded on boot
   */
  currencyObject: computed('model.auth_currency', 'model.cost_currency', function() {
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
  /** 
     @method currencyObjects 
     power select dropdown list of currencies
   */
  currencyObjects: computed(function() {
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
      return currency_service.formatCurrency(get(this, 'model').get(field), precision);
    }));
  },
  placeholderAmount: computed(function() {
    const currency = get(this, 'currencyObject');
    const field = get(this, 'field');
    let amount = get(currency, `model.${field}`) ? get(currency, `model.${field}`) : 0;
    return parseFloat(amount).toFixed(get(currency, 'decimal_digits'));
  }),
  setFocusedOut: task(function * () {
    yield timeout(TIMEOUT);
    if (this.get('isInvalid')) {
      this.set('focusedOut', true);
    }
  }).restartable(),
  actions: {
    formatCurrency() {
      const field = get(this, 'field');
      const currency_service = get(this, 'currency');
      const precision = get(this, 'currencyObject').get('decimal_digits');
      set(this, 'model.' + field, currency_service.formatCurrency(get(this, 'bound_field'), precision));
      if (this.get('isInvalid')) { this.set('focusedOut', true); }
    },
    selected(obj) {
      const model = get(this, 'model');
      const currencyField = get(this, 'currencyField');
      model.set(currencyField, get(obj, 'id'));
    },
    keyedUp() {
      if (this.get('isInvalid')) {
        this.get('setFocusedOut').perform();
      } else {
        this.set('focusedOut', false);
      }
    }
  }
});
