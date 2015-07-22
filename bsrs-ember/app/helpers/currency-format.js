import Ember from 'ember';

export default Ember.HTMLBars.makeBoundHelper((params) => {
    var val = params[0],
        currency = params[1],
        attr = params[2],
        formatted = '',
        currency_list = 
        {
            "USD": {
                "symbol": "$",
                "name": "US Dollar",
                "symbol_native": "$",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "USD",
                "name_plural": "US dollars"
            },
            "CAD": {
                "symbol": "CA$",
                "name": "Canadian Dollar",
                "symbol_native": "$",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "CAD",
                "name_plural": "Canadian dollars"
            },
            "EUR": {
                "symbol": "€",
                "name": "Euro",
                "symbol_native": "€",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "EUR",
                "name_plural": "euros"
            },
            "CNY": {
                "symbol": "CN¥",
                "name": "Chinese Yuan",
                "symbol_native": "CN¥",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "CNY",
                "name_plural": "Chinese yuan"
            },
        };

    switch(currency) {
        case 'USD':
            var currency_found = currency_list[currency];

        if (attr !== 'decimal_digits') {
            formatted = currency_found[attr];
        } else {
            formatted = parseInt(val).toFixed(currency_found[attr]);
        }
        break;
    }
    return formatted;
});
