import { isFilterChecked } from 'bsrs-ember/helpers/is-filter-checked';
import { module, test } from 'qunit';

module('Unit | Helper | is filter checked');

test('it returns false if key is equal to column.field and filterModel.name is the value', function(assert) {
  let result = isFilterChecked(null, {option: 'ticket.priority.high', field: 'priority.translated_name', gridFilterParams: {'priority.translated_name': 'ticket.priority.emergency'}});
  assert.ok(!result);
});

test('it returns true if key is equal to column.field and filterModel.name is the value', function(assert) {
  let result = isFilterChecked(null, {option: 'ticket.priority.emergency', field: 'priority.translated_name', gridFilterParams: {'priority.translated_name': 'ticket.priority.emergency'}});
  assert.ok(result);
});

test('it returns false if field not in gridFilterParams', function(assert) {
  let result = isFilterChecked(null, {option: 'ticket.priority.emergency', field: 'priority.translated_name', gridFilterParams: {}});
  assert.ok(!result);
});
