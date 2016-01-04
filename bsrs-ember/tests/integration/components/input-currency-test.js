import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import translation from "bsrs-ember/instance-initializers/ember-i18n";
import PEOPLE_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import CURRENCY_DEFAULTS from 'bsrs-ember/vendor/defaults/currencies';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';

const LONG_AUTH_AMOUNT = '50000.0000';

var container, registry, store, model, service, run = Ember.run;

moduleForComponent('input-currency', 'integration: input-currency test', {
    integration: true,
    setup() {
        store = module_registry(this.container, this.registry, ['model:person', 'model:currency', 'service:currency']);
        run(function() {
            store.push('currency', CURRENCY_DEFAULTS);
        });
        translation.initialize(this);
    }
});

test('renders a component with no value when bound attr is undefined', function(assert) {
    run(function() {
        model = store.push('person', {id: PEOPLE_DEFAULTS.id, auth_amount: undefined});
    });
    this.set('model', model);
    this.render(hbs`{{input-currency model=model field="auth_amount"}}`);
    var $component = this.$('.t-input-currency');
    assert.equal($component.find('.t-amount').val(), '');
});

test('renders a component with currency and label', function(assert) {
    run(function() {
        model = store.push('person', {id: PEOPLE_DEFAULTS.id, auth_amount: LONG_AUTH_AMOUNT, currency: CURRENCY_DEFAULTS.id});
    });
    this.set('model', model);
    this.render(hbs`{{input-currency model=model field="auth_amount"}}`);
    var $component = this.$('.t-input-currency');
    assert.equal($component.find('.t-currency-symbol').text().trim(), CURRENCY_DEFAULTS.symbol_native);
    assert.equal($component.find('.t-currency-code').text().trim(), CURRENCY_DEFAULTS.code);
    assert.equal($component.find('.t-amount').val(), PEOPLE_DEFAULTS.auth_amount);
});

test('the models bound field will update both the formatted input value and the model itself', function(assert) {
    run(function() {
        model = store.push('person', {id: PEOPLE_DEFAULTS.id, auth_amount: LONG_AUTH_AMOUNT, currency: CURRENCY_DEFAULTS.id});
    });
    this.set('model', model);
    this.render(hbs`{{input-currency model=model field="auth_amount"}}`);
    var $component = this.$('.t-input-currency');
    $component.find('.t-amount').val('30').trigger('change');
    assert.equal($component.find('.t-currency-symbol').text().trim(), CURRENCY_DEFAULTS.symbol_native);
    assert.equal($component.find('.t-currency-code').text().trim(), CURRENCY_DEFAULTS.code);
    assert.equal($component.find('.t-amount').val(), '30.00');
    assert.equal(model.get('auth_amount'), '30');
});
