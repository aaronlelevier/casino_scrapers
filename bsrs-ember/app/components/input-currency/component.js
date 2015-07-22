import Ember from 'ember';

export default Ember.Component.extend({
    classNames: ['input-currency t-input-currency'],
    fieldNames: 'auth_amount',
    currency: Ember.inject.service(),
    currency_symbol: Ember.computed(function() {
        var currency_service = this.get('currency');
        return currency_service.format_symbol('USD');
    }),
    currency_code: Ember.computed(function() {
        var currency_service = this.get('currency');
        return currency_service.format_code('USD');
    }),
    currency_found: '',
    value: Ember.computed('model', {
        get(key){
            return this.get('model');
        },
        set(key, value){
            //TODO: Original value lost on first set
            var model = this.get('model');
            this.set('model', value);
            return this.get('model', value);
        }
    })
});
