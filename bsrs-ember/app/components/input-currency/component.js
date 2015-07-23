import Ember from 'ember';

export default Ember.Component.extend({
    currency: Ember.inject.service(),
    classNames: ['input-currency t-input-currency'],
    currency_symbol: Ember.computed(function() {
        var currency_service = this.get('currency');
        return currency_service.format_symbol('USD');
    }),
    currency_code: Ember.computed(function() {
        var currency_service = this.get('currency');
        return currency_service.format_code('USD');
    }),
    initialize: Ember.on("init", function() {
        var field = this.get("field");
        Ember.Binding.from("model." + field).to("bound_field").connect(this);
    }),
    formatted_auth_amount: Ember.computed('bound_field', {
        get(key){
            var currency_service = this.get('currency');
            return currency_service.format_currency(this.get('bound_field'), 'decimal_digits', 'USD');
        },
        set(key, value){
            this.set('bound_field', value);
            var currency_service = this.get('currency');
            return currency_service.format_currency(this.get('bound_field'), 'decimal_digits', 'USD');
        }
    })
});
