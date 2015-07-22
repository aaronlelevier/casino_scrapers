import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import translation from "bsrs-ember/instance-initializers/ember-i18n";
import Person from 'bsrs-ember/models/person';
import Currency from 'bsrs-ember/models/currency';
import PEOPLE_FACTORY from 'bsrs-ember/vendor/people_fixtures';
import CurrencyService from 'bsrs-ember/services/currency';
import Store from 'ember-cli-simple-store/store';
import CurrencyDefaults from 'bsrs-ember/vendor/currencies';

var container, registry, store, service;

moduleForComponent('input-currency', 'integration: input-currency test', {
    integration: true,
    setup() {
        this.container._registry.register('model:person', Person);
        this.container._registry.register('model:currency', Currency);
        this.container._registry.register('store:main', Store);
        this.container._registry.register('service:currency', CurrencyService);
        store = this.container.lookup('store:main');
        store.push('currency', CurrencyDefaults);
        translation.initialize(this);
    }
});

test('renders a component with currency and label', function(assert) {
    var model = store.push('person', {id: 1, auth_amount: '50000.0000'});
    this.set('model', model);
    
    this.render(hbs`{{input-currency model=model}}`);
    var $component = this.$('.t-input-currency');
    assert.equal($component.find('.t-currency-symbol').text().trim(), "$");
    assert.equal($component.find('.t-currency-code').text().trim(), "USD");
    assert.equal($component.find('.t-person-auth_amount').val(), "50000.00");
});
