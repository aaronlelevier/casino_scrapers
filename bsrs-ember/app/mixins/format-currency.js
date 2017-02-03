import Ember from 'ember';
const { Mixin, get, set, inject } = Ember;

export default Mixin.create({
  currency: inject.service(),
  /**
   * @method formatCurrency
   * @param {String|Number} amount
   * @param {String} currency_id
   * @return {String|Number} - formatted currency
   */
  formatCurrency(amount, currency_id) {
    const store = get(this, 'simpleStore');
    const currency = store.find('currency', currency_id);
    const precision = currency.get('decimal_digits');
    return get(this, 'currency').formatCurrency(amount, precision);
  }
});
