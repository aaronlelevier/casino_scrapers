import Ember from 'ember';
import inject from 'bsrs-ember/utilities/store';

var CurrencyService = Ember.Service.extend({
    store: inject('main'),
    format_currency(val, attr, currency) {
        //TODO: currency store should only have one currency (or multiple) based on config passed from Django
        var store = this.get('store');
        var currency_found = store.find('currency').objectAt(0);
        return parseInt(val).toFixed(currency_found[attr]);
    },
    format_symbol(currency) {
        var store = this.get('store');
        var currency_found = store.find('currency').objectAt(0);
        return currency_found.symbol;
    },
    format_code(currency) {
        var store = this.get('store');
        var currency_found = store.find('currency').objectAt(0);
        return currency_found.code;
    }
});

export default CurrencyService;
