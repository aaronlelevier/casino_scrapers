import Ember from 'ember';
const { get } = Ember;

let CurrencyService = Ember.Service.extend({
  simpleStore: Ember.inject.service(),
  _getPersonCurrency() {
    // should always be using the person-current here.
    let store = get(this, 'simpleStore');
    let person = store.find('person-current').objectAt(0).get('person');
    let currencyId = person.get('auth_currency') ? person.get('auth_currency') : person.get('inherited').auth_currency.inherited_value;
    return store.find('currency', currencyId);
  },
  _getDefaultCurrency() {
    // a single Currency will be marked as the default server side
    // based on the Tenant's General Settings. Then return default here.
    return get(this, 'simpleStore').find('currency', {default: true}).objectAt(0);
  },
  _getCurrency(currencyId) {
    return get(this, 'simpleStore').find('currency', currencyId);
  },
  getCurrencies() {
    return get(this, 'simpleStore').find('currency');
  },
  /**
     @method currencyObject
     @param { String } currencyId - optional
     @param { String } inheritsFrom - optional
     model.currencyField is an FK to a currency object loaded on boot
   */
  getCurrencyObject(currencyId, inheritsFrom) {
    if (currencyId) {
      return this._getCurrency(currencyId); 
    } else if (inheritsFrom) {
      return this._getPersonCurrency();
    }
    return this._getDefaultCurrency();
  },
  formatCurrency(val, currencyId, inheritsFrom) {
    const currencyObject = this.getCurrencyObject(currencyId, inheritsFrom);
    const precision = currencyObject.get('decimal_digits');
    // 0 may be falsy but we still want to display something?
    // isNaN(parseFloat()) takes care of '' and 'abc' b/c '' gets converted to 0, so thinks it is a number
    return !isNaN(parseFloat(val)) ? parseFloat(val).toFixed(precision) : '';
  }
});

export default CurrencyService;
