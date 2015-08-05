import Ember from 'ember';
import inject from 'bsrs-ember/utilities/store';

var CurrencyService = Ember.Service.extend({
    store: inject('main'),
    format_currency(val, attr, currency) {
        var store = this.get('store');
        var currency_found = store.find('currency').objectAt(0);
        var formatted_value = parseInt(val);
        return formatted_value ? formatted_value.toFixed(currency_found[attr]) : '';
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
