import Ember from 'ember';

export function getCurrencyObject(_params, { currencyService, currencyId, inheritsFrom }) {
  return currencyService.getCurrencyObject(currencyId, inheritsFrom);
}

export default Ember.Helper.helper(getCurrencyObject);
