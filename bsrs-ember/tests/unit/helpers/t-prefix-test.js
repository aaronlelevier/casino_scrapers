import TPrefix from '../../../helpers/t-prefix';
import { module, test } from 'qunit';

module('Unit | Helper | t-prefix');

test('it replaces name with name', function(assert) {
  let result = TPrefix.compute(['ticket.label', 'priority-name']);
  assert.equal(result, 'ticket.label.priority-name');
});
