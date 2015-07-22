import Ember from 'ember';
import inject from 'bsrs-ember/utilities/store';

var CurrencyService = Ember.Service.extend({
    store: inject('main'),
    format_currency: function(val, attr, currency) {
        var store = this.get('store');
        var currency_found = store.find('currency').objectAt(0);
        return parseInt(val).toFixed(currency_found[attr]);
    },
    format_symbol: function(currency) {
        var store = this.get('store');
        var currency_found = store.find('currency').objectAt(0);
        return currency_found.symbol;
    },
    format_code: function(currency) {
        var store = this.get('store');
        var currency_found = store.find('currency').objectAt(0);
        return currency_found.code;
    }
});

export default CurrencyService;
