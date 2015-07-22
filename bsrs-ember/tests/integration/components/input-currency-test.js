import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import translation from "bsrs-ember/instance-initializers/ember-i18n";
import Person from 'bsrs-ember/models/person';
import PEOPLE_FACTORY from 'bsrs-ember/vendor/people_fixtures';
import CurrencyService from 'bsrs-ember/services/currency';

moduleForComponent('input-currency', 'integration: input-currency test', {
    integration: true,
    setup() {
        translation.initialize(this);
    }
});

test('renders a component with currency and label', function(assert){
    var model = Person.create({id: 1, auth_amount: '50000.0000'});
    var service = CurrencyService.create({});
    model.set('currency', service);
    this.set('model', model);
    this.render(hbs`{{input-currency model=model}}`);
    var $component = this.$('.t-input-currency');
    assert.equal($component.find('.t-currency-symbol').text().trim(), "$");
    assert.equal($component.find('.t-currency-code').text().trim(), "USD");
    assert.equal($component.find('.t-person-auth_amount').val(), "50000.00");
});
