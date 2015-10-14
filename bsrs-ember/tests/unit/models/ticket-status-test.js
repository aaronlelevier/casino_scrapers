import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import TICKET_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket';

var store;

module('unit: ticket status test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:ticket-status']);
    }
});

test('ticket status is dirty or related is dirty when model has been updated', (assert) => {
    let status = store.push('ticket-status', {id: TICKET_DEFAULTS.statusOneId, name: TICKET_DEFAULTS.statusOne});
    assert.ok(status.get('isNotDirty'));
    status.set('name', 'abc');
    assert.ok(status.get('isDirty'));
    status.set('name', TICKET_DEFAULTS.statusOne);
    assert.ok(status.get('isNotDirty'));
});
