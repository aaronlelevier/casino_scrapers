import Ember from 'ember';

export default Ember.Component.extend({
    currency: Ember.inject.service(),
    classNames: ['input-currency t-input-currency'],
    currency_symbol: Ember.computed(function() {
        let currency_service = this.get('currency');
        let person = this.get('model');
        return currency_service.format_symbol(person);
    }),
    currency_code: Ember.computed(function() {
        let currency_service = this.get('currency');
        let person = this.get('model');
        return currency_service.format_code(person);
    }),
    initialize: Ember.on('init', function() {
        let field = this.get('field');
        Ember.Binding.from('model.' + field).to('bound_field').connect(this);
    }),
    actions: {
        format_currency(){
            let field = this.get('field');
            let currency_service = this.get('currency');
            this.set('model.' + field, currency_service.format_currency(this.get('bound_field'), 'decimal_digits', 'USD'));
        }
    }
});
