import Ember from 'ember';

export default Ember.Component.extend({
    currency: Ember.inject.service(),
    simpleStore: Ember.inject.service(),
    classNames: ['input-currency t-input-currency'],
    currencyObject: Ember.computed('model.auth_currency', function() {
        let currency_service = this.get('currency');
        let person = this.get('model');
        let store = this.get('simpleStore');
        return person.get('auth_currency') ? store.find('currency', person.get('auth_currency')) : currency_service.getCurrency();
    }),
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
            let person = this.get('model');
            person.set('auth_currency', obj.get('id'));
        }
    }
});
