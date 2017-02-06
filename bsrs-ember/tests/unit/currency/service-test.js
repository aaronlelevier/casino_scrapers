import Ember from 'ember';
const { run } = Ember;
import { moduleFor, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import CurrencyD from 'bsrs-ember/vendor/defaults/currency';

let store;

moduleFor('service:currency', 'Unit | Service | currency', {
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:currency']);
    run(() => {
      store.push('currency', { id: CurrencyD.idOne, name: CurrencyD.name });
    });
  }
});

test('it formats currency', function(assert) {
  let service = this.subject();
  const currency = service.formatCurrency('1200.0001', CurrencyD.idOne);
  assert.equal(currency, '1,200.00');
});

test('it formats currency based on decimal_digits', function(assert) {
  run(() => {
    store.push('currency', { id: CurrencyD.idOne, name: CurrencyD.name, decimal_digits: 4 });
  });
  let service = this.subject();
  const currency = service.formatCurrency('1200.00016', CurrencyD.idOne);
  assert.equal(currency, '1,200.0002');
});

test('it formats currency based on symbol', function(assert) {
  run(() => {
    store.push('currency', { id: CurrencyD.idOne, name: CurrencyD.name, symbol: "€" });
  });
  let service = this.subject();
  const currency = service.formatCurrency('1200.0001', CurrencyD.idOne);
  assert.equal(currency, '1,200.00');
});
