import Ember from 'ember';

export default Ember.Component.extend({
    currency: Ember.inject.service(),
    simpleStore: Ember.inject.service(),
    classNames: ['input-currency t-input-currency'],
    currencyObjects: Ember.computed(function() {
        let currency_service = this.get('currency');
        let person = this.get('model');
        return currency_service.getCurrencies();
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
        },
        selected(obj) {
            let currency_service = this.get('currency');
            let model = this.get('model');
            model.set('auth_currency', obj.get('id'));
        }
    }
});
