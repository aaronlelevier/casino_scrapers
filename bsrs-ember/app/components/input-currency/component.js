import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
const { get, set, computed, isEmpty, inject } = Ember;
import ValidationInput from 'bsrs-ember/components/validated-input/component';
import unformat from 'accounting/unformat';
import { task, timeout } from 'ember-concurrency';

const DEBOUNCE_MS = config.APP.CURRENCY_INPUT_DEBOUNCE;

/**
 * @property InputCurrency
 * model {Object} required
 * field {String} required - model property for value in input-currency
 * currencyField {String} required - model property for id pointing to correct currency in simple store
 * inheritsFrom {String|Number} optional - if currency is inherited from another object
 * placeholder {String} optional
 */
export default ValidationInput.extend({
  currency: inject.service(),
  classNames: ['input-currency t-input-currency'],
  classNameBindings: ['readonly'],
  attributeBindings: ['valuePath:id'],
  /**
   * define computed hasCurrencyValue to format number in template only if number is 0 or truthy
   * define currencyObject to get for precision or symbol in template
   * @method init
   */
  init() {
    this._super(...arguments);

    const field = get(this, 'valuePath');
    Ember.defineProperty(this, 'hasCurrencyValue', computed(`model.${field}`, function() {
      const value = get(this, `model.${field}`);
      return value === 0 || !!value;
    }));

    const currencyField = get(this, 'currencyField');
    Ember.defineProperty(this, 'currencyObject', computed(`model.${currencyField}`, function() {
      const currencyId = get(this, `model.${currencyField}`);
      const inheritsFrom = get(this, 'inheritsFrom');
      return get(this, 'currency').getCurrencyObject(currencyId, inheritsFrom);
    }));
  },
  /**
   * @property currencyObjects
   * power select dropdown list of currencies
   * @type Array
   */
  currencyObjects: computed(function() {
    let currency_service = get(this, 'currency');
    return currency_service.getCurrencies();
  }),
  /**
   * oninput
   * debounce interval (CURRENCY_INPUT_DEBOUNCE) so that user has time to type
   * restart timer as user is typing
   * @property setModelTask
   * @param {String} value
   */
  setModelTask: task(function * (value) {
    if (isEmpty(value)) {
      // to show validation msgs right away
      this.setModelValue();
      return this.send('keyedUp');
    }
    yield timeout(DEBOUNCE_MS);

    // remove trailing decimals less than 5 (12.122 -> 12.12)
    this.$('input').val(this.formatValue(value));

    // set model value unformatted
    this.setModelValue(value);
    return this.send('keyedUp');
  }).restartable(),
  /**
   * only call set if value is different than existing
   * parseFloat value to remove all dashes in between numbers/other formatting errors
   * @method setModelValue
   * @param {String|Number} value - if no value, then set to nothing
   */
  setModelValue(value=null) {
    const field = get(this, 'valuePath');
    let existingValue = get(this, `model.${field}`);
    // unformat both values so comparing 100 and not 100 vs 100.00
    if (parseFloat(existingValue) !== parseFloat(value)) {
      set(this, `model.${field}`, isEmpty(value) ? value : unformat(value));
    }
  },
  /**
   * @method formatValue
   * @return {Number}
   */
  formatValue(value) {
    // format based on precision
    const currencyField = get(this, 'currencyField');
    const inheritsFrom = get(this, 'inheritsFrom');
    const currencyId = get(this, `model.${currencyField}`);
    // ensure not setting more than 4 decimals
    return get(this, 'currency').formatCurrency(value, currencyId, inheritsFrom);
  },
  actions: {
    /**
     * formats the currency with the correct decimal points and update the model's field
     * @method formatCurrency
     * @param {String|Number} value
     */
    formatCurrency(value) {
      if (isEmpty(value)) {
        // need to set to null so serialize sends up key: null rather than nothing
        this.setModelValue();
      } else {
        this.setModelValue(this.formatValue(value));
      }

      // ensure validation styling is removed right away
      if (this.get('isValid')) {
        this.set('invalidClass', false); 
      }
    },
    /**
     * sets the id of the selected currency to the currency field
     * @method selected
     * @param {Object} obj
     */
    selected(obj) {
      const model = get(this, 'model');
      const currencyField = get(this, 'currencyField');
      set(model, currencyField, get(obj, 'id'));
    },
  }
});
