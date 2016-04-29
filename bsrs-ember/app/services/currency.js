import Ember from 'ember';
import inject from 'bsrs-ember/utilities/store';

let CurrencyService = Ember.Service.extend({
    simpleStore: Ember.inject.service(),
    getCurrency(person) {
        let store = this.get('simpleStore');
        let currencyId = person.get('currency') !== undefined ? person.get('currency') : store.find('currency').objectAt(0).get('id');
        return store.find('currency', currencyId);
    },
    format_currency(val, attr, currency) {
        let store = this.get('simpleStore');
        let currency_found = store.find('currency').objectAt(0);
        let formatted_value = parseInt(val, 10);
        return formatted_value || formatted_value === 0 ? formatted_value.toFixed(currency_found[attr]) : '';
    },
    format_symbol(person) {
        let currency = this.getCurrency(person);
        return currency.get('symbol');
    },
    format_code(person) {
        let currency = this.getCurrency(person);
        return currency.get('code');
    }
});

export default CurrencyService;
