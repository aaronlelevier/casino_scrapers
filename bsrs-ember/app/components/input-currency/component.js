import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
const { get, set, computed } = Ember;
import ValidationInput from 'bsrs-ember/components/validated-input/component';

/**
 * API
 *
 */
export default ValidationInput.extend({
  currency: Ember.inject.service(),
  simpleStore: Ember.inject.service(),
  classNames: ['input-currency t-input-currency'],
  classNameBindings: ['readonly'],
  attributeBindings: ['valuePath:id'],
  /**
     @method currencyObject
     @param { string } currencyField - API e.g. "auth_currency"
     @param { string } inheritsFrom - not req from API
     model.currencyField is an FK to a currency object loaded on boot
   */
  currencyObject: computed('model.auth_currency', 'model.cost_currency', 'model.cost_estimate_currency', function() {
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
  placeholderAmount: computed(function() {
    const currency = get(this, 'currencyObject');
    const field = get(this, 'field');
    let amount = get(currency, `model.${field}`) ? get(currency, `model.${field}`) : 0;
    return parseFloat(amount).toFixed(get(currency, 'decimal_digits'));
  }),
  actions: {
    /**
     * formats the currency with the correct decimal points
     * @method formatCurrency
     */
    formatCurrency() {
      const field = get(this, 'field');
      const currency_service = get(this, 'currency');
      const precision = get(this, 'currencyObject').get('decimal_digits');
      const bound_field = get(this, `model.${field}`);

      const typedInput = currency_service.formatCurrency(bound_field, precision);
      set(this, 'model.' + field, typedInput);
    },
    /**
     * remove any non number or comma or decimal
     * @method keyedUp
     */
    keyedUp() {
      // remove negative sign
      let field = get(this, 'field');
      let bound_field = get(this, `model.${field}`);
      if (bound_field.match(/[^0-9.,]/g)) {
        bound_field = bound_field.replace(/[^0-9.,]/g, '');
        set(this, 'model.' + field, bound_field);
      }
      this._super(...arguments);
    },
    /**
     * sets the id of the selected currency to the currency field
     * @method selected
     */
    selected(obj) {
      const model = get(this, 'model');
      const currencyField = get(this, 'currencyField');
      model.set(currencyField, get(obj, 'id'));
    },
  }
});
