import Ember from 'ember';
const { run } = Ember;
import { test, module } from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import { getCurrencyObject } from 'bsrs-ember/helpers/get-currency-object';
import CurrencyD from 'bsrs-ember/vendor/defaults/currency';

let currencyService, currency;

module('Unit | Helper | get currency object', {
  beforeEach() {
    const store = module_registry(this.container, this.registry, ['model:currency', 'service:currency']);
    currencyService = this.container.lookup('service:currency');
    run(() => {
      currency = store.push('currency', { id: CurrencyD.idOne, name: CurrencyD.name });
    });
  }
});

test('it returns currency object based on currencies loaded in local cache', function(assert) {
  let result = getCurrencyObject(null, { currencyService, currencyId: currency.get('id') });
  assert.equal(result.get('id'), currency.get('id'));
});

