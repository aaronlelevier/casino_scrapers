import Ember from 'ember';
const { run } = Ember;
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import LINK from 'bsrs-ember/vendor/defaults/link';
import TP from 'bsrs-ember/vendor/defaults/ticket-priority';

var store, priority, link, uuid;

module('unit: link test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:link', 'model:ticket-priority', 'service:i18n']);
        run(() => {
            priority = store.push('ticket-priority', {id: TP.priorityOneId, name: TP.priorityOne});
            store.push('ticket-priority', {id: TP.priorityTwoId, name: TP.priorityTwo});
            link = store.push('link', {id: LINK.idOne});
        });
    }
});

test('request dirty tracking', (assert) => {
    assert.ok(!link.get('isDirty'));
    link.set('request', LINK.requestOne);
    assert.ok(link.get('isDirty'));
    link.set('request', '');
    assert.ok(link.get('isNotDirty'));
});

// TODO: check these 3 tests b/c not String types
test('order dirty tracking', (assert) => {
    assert.ok(!link.get('isDirty'));
    link.set('order', LINK.orderOne);
    assert.ok(link.get('isDirty'));
    link.set('order', '');
    assert.ok(link.get('isNotDirty'));
});

test('action_button dirty tracking', (assert) => {
    assert.ok(!link.get('isDirty'));
    link.set('action_button', LINK.action_buttonOne);
    assert.ok(link.get('isDirty'));
    link.set('action_button', '');
    assert.ok(link.get('isNotDirty'));
});

test('is_header dirty tracking', (assert) => {
    assert.ok(!link.get('isDirty'));
    link.set('is_header', LINK.is_headerOne);
    assert.ok(link.get('isDirty'));
    link.set('is_header', '');
    assert.ok(link.get('isNotDirty'));
});

test('priority', (assert) => {
    assert.ok(!link.get('priority'));
    run(() => {
        priority = store.push('ticket-priority', {id: TP.priorityOneId, links: [LINK.idOne]});
    });
    assert.equal(link.get('priority').get('id'), TP.priorityOneId);
    assert.equal(link.get('priority').get('name'), TP.priorityOne);
    assert.deepEqual(priority.get('links'), [LINK.idOne]);
});
test('priority related dirty tracking', (assert) => {
    assert.ok(!link.get('priority'));
    run(() => {
        priority = store.push('ticket-priority', {id: TP.priorityOneId, links: [LINK.idOne]});
        link = store.push('link', {id: LINK.idOne, priority_fk: TP.priorityOneId});
    });
    assert.ok(link.get('isNotDirty'));
    assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(link.get('priority').get('id'), TP.priorityOneId);
    run(() => {
        priority = store.push('ticket-priority', {id: TP.priorityOneId, links: []});
        priority = store.push('ticket-priority', {id: TP.priorityTwoId, links: [LINK.idOne]});
    });
    assert.equal(link.get('priority').get('id'), TP.priorityTwoId);
    assert.ok(link.get('isNotDirty'));
    assert.ok(link.get('isDirtyOrRelatedDirty'));
});

test('change_priority changes priority', (assert) => {
    assert.equal(link.get('priority.id'), undefined);
    link.change_priority(TP.priorityOneId);
    assert.equal(link.get('priority.id'), TP.priorityOneId);
    link.change_priority(TP.priorityTwoId);
    assert.equal(link.get('priority.id'), TP.priorityTwoId);
});

test('aaron change_priority to null', (assert) => {
    assert.equal(link.get('priority.id'), undefined);
    link.change_priority(TP.priorityOneId);
    assert.equal(link.get('priority.id'), TP.priorityOneId);
    link.change_priority(null);
    assert.equal(link.get('priority.id'), null);
});
