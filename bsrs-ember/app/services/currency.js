import Ember from 'ember';
import inject from 'bsrs-ember/utilities/store';

let CurrencyService = Ember.Service.extend({
  simpleStore: Ember.inject.service(),
  getPersonCurrency() {
    // should always be using the person-current here.
    let store = this.get('simpleStore');
    let person = store.find('person-current').objectAt(0).get('person');
    let currencyId = person.get('auth_currency') ? person.get('auth_currency') : person.get('inherited').auth_currency.inherited_value;
    return store.find('currency', currencyId);
  },
  getDefaultCurrency() {
    // a single Currency will be marked as the default server side
    // based on the Tenant's General Settings. Then return default here.
    let store = this.get('simpleStore');
    return store.find('currency', {default: true}).objectAt(0);
  },
  getCurrencies() {
    let store = this.get('simpleStore');
    return store.find('currency');
  },
  format_currency(val, precision) {
    // 0 may be falsy but we still want to display something?
    // isNaN(parseFloat()) takes care of '' and 'abc' b/c '' gets converted to 0, so thinks it is a number
    return !isNaN(parseFloat(val)) ? parseFloat(val).toFixed(precision) : '';
  }
});

export default CurrencyService;
