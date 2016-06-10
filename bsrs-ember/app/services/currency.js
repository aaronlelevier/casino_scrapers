import Ember from 'ember';
import inject from 'bsrs-ember/utilities/store';

let CurrencyService = Ember.Service.extend({
    simpleStore: Ember.inject.service(),
    getCurrency() {
        // should always be using the person-current here.
        let store = this.get('simpleStore');
        let person = store.find('person-current').objectAt(0).get('person');
        let currencyId = person.get('auth_currency') ? person.get('auth_currency') : person.get('settings_object').auth_currency.inherited_value;
        return store.find('currency', currencyId);
    },
    getCurrencies() {
        let store = this.get('simpleStore');
        return store.find('currency');
    },
    format_currency(val, precision) {
        return val ? parseFloat(val).toFixed(precision) : '';
    }
});

export default CurrencyService;
