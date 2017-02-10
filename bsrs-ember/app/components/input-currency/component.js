import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
const { get, set, computed } = Ember;
import ValidationInput from 'bsrs-ember/components/validated-input/component';

/**
 * @property InputCurrency
 * model {Object} required
 * field {String} required - model property for value in input-currency
 * currencyField {String} required - model property for id pointing to correct currency in simple store
 * inheritsFrom {String|Number} optional - if currency is inherited from another object
 * placeholder {String} optional
 */
export default ValidationInput.extend({
  currency: Ember.inject.service(),
  classNames: ['input-currency t-input-currency'],
  classNameBindings: ['readonly'],
  attributeBindings: ['valuePath:id'],
  /**
   * @property currencyObjects
   * power select dropdown list of currencies
   * @type Array
   */
  currencyObjects: computed(function() {
    let currency_service = get(this, 'currency');
    return currency_service.getCurrencies();
  }),
  actions: {
    /**
     * formats the currency with the correct decimal points and update the model's field
     * @method formatCurrency
     */
    formatCurrency() {
      const currencyService = get(this, 'currency');

      const field = get(this, 'field');
      const boundField = get(this, `model.${field}`);

      const currencyField = get(this, 'currencyField');
      const currencyId = get(this, `model.${currencyField}`);
      const inheritsFrom = get(this, 'inheritsFrom');

      const typedInput = currencyService.formatCurrency(boundField, currencyId, inheritsFrom);
      if (boundField === '') {
        // need to set to null so serialize sends up key: null rather than nothing
        set(this, 'model.' + field, null);
      } else {
        set(this, 'model.' + field, typedInput);
      }
    },
    /**
     * remove any non (number comma decimal). ie. remove negative sign for example
     * @method keyedUp
     */
    keyedUp() {
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
      set(model, currencyField, get(obj, 'id'));
    },
  }
});
