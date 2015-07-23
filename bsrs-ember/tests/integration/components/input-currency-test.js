import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import translation from "bsrs-ember/instance-initializers/ember-i18n";
import PEOPLE_FACTORY from 'bsrs-ember/vendor/people_fixtures';
import CurrencyDefaults from 'bsrs-ember/vendor/currencies';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';

var container, registry, store, service;

moduleForComponent('input-currency', 'integration: input-currency test', {
    integration: true,
    setup() {
        store = module_registry(this.container, this.registry, ['model:person', 'model:currency', 'service:currency']);
        store.push('currency', CurrencyDefaults);
        translation.initialize(this);
    }
});

test('renders a component with currency and label', function(assert) {
    var model = store.push('person', {id: 1, auth_amount: '50000.0000'});
    this.set('model', model);
    this.render(hbs`{{input-currency model=model field="auth_amount"}}`);
    var $component = this.$('.t-input-currency');
    assert.equal($component.find('.t-currency-symbol').text().trim(), "$");
    assert.equal($component.find('.t-currency-code').text().trim(), "USD");
    assert.equal($component.find('.t-person-auth_amount').val(), "50000.00");
});

test('the models bound field will update both the formatted input value and the model itself', function(assert) {
    var model = store.push('person', {id: 1, auth_amount: '50000.0000'});
    this.set('model', model);
    this.render(hbs`{{input-currency model=model field="auth_amount"}}`);
    var $component = this.$('.t-input-currency');
    $component.find('.t-person-auth_amount').val('30').trigger('change');
    assert.equal($component.find('.t-currency-symbol').text().trim(), "$");
    assert.equal($component.find('.t-currency-code').text().trim(), "USD");
    assert.equal($component.find('.t-person-auth_amount').val(), "30.00");
    assert.equal(model.get('auth_amount'), '30');
});
