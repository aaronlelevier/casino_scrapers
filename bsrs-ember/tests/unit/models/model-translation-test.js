import {test, module} from 'bsrs-ember/tests/helpers/i18n/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';

var store;

module('unit: model translation test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:category', 'model:ticket-priority', 'model:ticket-status', 'service:i18n']);
    }
});

test('category translated name returns correct value', (assert) => {
    let category = store.push('category', {id: 1, name: ''});
    assert.equal(category.get('translated_name'), '');
    category.set('name', 'admin.category.name.repair');
    assert.equal(category.get('translated_name'), 'Repair');
});

test('ticket-priority translated name returns correct value', (assert) => {
    let priority = store.push('ticket-priority', {id: 1, name: ''});
    assert.equal(priority.get('translated_name'), '');
    priority.set('name', 'ticket.priority.high');
    assert.equal(priority.get('translated_name'), 'High');
});

test('ticket-status translated name returns correct value', (assert) => {
    let status = store.push('ticket-status', {id: 1, name: ''});
    assert.equal(status.get('translated_name'), '');
    status.set('name', 'ticket.status.draft');
    assert.equal(status.get('translated_name'), 'Draft');
});
