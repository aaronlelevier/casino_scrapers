import Ember from 'ember';
const { run } = Ember;
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import LINK from 'bsrs-ember/vendor/defaults/link';
import TP from 'bsrs-ember/vendor/defaults/ticket-priority';
import TD from 'bsrs-ember/vendor/defaults/ticket';

var store, priority, status, link, uuid;

module('unit: link test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:link', 'model:ticket-priority', 'model:ticket-status', 'service:i18n']);
        run(() => {
            priority = store.push('ticket-priority', {id: TP.priorityOneId, name: TP.priorityOne});
            store.push('ticket-priority', {id: TP.priorityTwoId, name: TP.priorityTwo});
            status = store.push('ticket-status', {id: TD.statusOneId, name: TD.statusOne});
            store.push('ticket-status', {id: TD.statusTwoId, name: TD.statusTwo});
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

// priority

test('priority relationship is setup correctly', (assert) => {
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

test('change_priority to null', (assert) => {
    assert.equal(link.get('priority.id'), undefined);
    link.change_priority(TP.priorityOneId);
    assert.equal(link.get('priority.id'), TP.priorityOneId);
    link.change_priority(null);
    assert.equal(link.get('priority.id'), null);
});

// status

test('status relationship is setup correctly', (assert) => {
    assert.ok(!link.get('status'));
    run(() => {
        status = store.push('ticket-status', {id: TD.statusOneId, name: TD.statusOne, links: [LINK.idOne]});
    });
    assert.equal(link.get('status').get('id'), TD.statusOneId);
    assert.equal(link.get('status').get('name'), TD.statusOne);
    assert.deepEqual(status.get('links'), [LINK.idOne]);
});

test('status related dirty tracking', (assert) => {
    assert.ok(!link.get('status'));
    run(() => {
        status = store.push('ticket-status', {id: TD.statusOneId, links: [LINK.idOne]});
        link = store.push('link', {id: LINK.idOne, status_fk: TD.statusOneId});
    });
    assert.ok(link.get('isNotDirty'));
    assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(link.get('status').get('id'), TD.statusOneId);
    run(() => {
        status = store.push('ticket-status', {id: TD.statusOneId, links: []});
        status = store.push('ticket-status', {id: TD.statusTwoId, links: [LINK.idOne]});
    });
    assert.equal(link.get('status').get('id'), TD.statusTwoId);
    assert.ok(link.get('isNotDirty'));
    assert.ok(link.get('isDirtyOrRelatedDirty'));
});

test('change_status changes status', (assert) => {
    assert.equal(link.get('status.id'), undefined);
    link.change_status(TD.statusOneId);
    assert.equal(link.get('status.id'), TD.statusOneId);
    link.change_status(TD.statusTwoId);
    assert.equal(link.get('status.id'), TD.statusTwoId);
});

test('change_status to null', (assert) => {
    assert.equal(link.get('status.id'), undefined);
    link.change_status(TD.statusOneId);
    assert.equal(link.get('status.id'), TD.statusOneId);
    link.change_status(null);
    assert.equal(link.get('status.id'), null);
});

// rollbackRelated

test('rollbackRelated priority - value value value', (assert) => {
    let priority_two;
    run(() => {
        priority = store.push('ticket-priority', {id: TP.priorityOneId, links: [LINK.idOne]});
        priority_two = store.push('ticket-priority', {id: TP.priorityTwoId});
        link = store.push('link', {id: LINK.idOne, priority_fk: TP.priorityOneId});
    });
    assert.equal(link.get('priority.id'), TP.priorityOneId);
    assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
    link.change_priority(TP.priorityTwoId);
    assert.equal(link.get('priority.id'), TP.priorityTwoId);
    assert.ok(link.get('isDirtyOrRelatedDirty'));
    link.rollbackRelated();
    assert.equal(link.get('priority.id'), TP.priorityOneId);
    assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
});

test('rollbackRelated priority - value null value', (assert) => {
    let priority_two;
    run(() => {
        priority = store.push('ticket-priority', {id: TP.priorityOneId, links: [LINK.idOne]});
        priority_two = store.push('ticket-priority', {id: TP.priorityTwoId});
        link = store.push('link', {id: LINK.idOne, priority_fk: TP.priorityOneId});
    });
    assert.equal(link.get('priority.id'), TP.priorityOneId);
    assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
    link.change_priority(null);
    assert.equal(link.get('priority.id'), null);
    assert.ok(link.get('isDirtyOrRelatedDirty'));
    link.rollbackRelated();
    assert.equal(link.get('priority.id'), TP.priorityOneId);
    assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
});

test('saveRelated', (assert) => {
    assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
    link.change_priority(TP.priorityOneId);
    assert.ok(link.get('isDirtyOrRelatedDirty'));
    link.saveRelated();
    assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
});

test('saveRelated null priority', (assert) => {
    let priority_two;
    run(() => {
        priority = store.push('ticket-priority', {id: TP.priorityOneId, links: [LINK.idOne]});
        priority_two = store.push('ticket-priority', {id: TP.priorityTwoId});
        link = store.push('link', {id: LINK.idOne, priority_fk: TP.priorityOneId});
    });
    link.change_priority(null);
    assert.equal(link.get('priority'), undefined);
    assert.ok(link.get('isDirtyOrRelatedDirty'));
    link.saveRelated();
    assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
    assert.ok(link.get('priorityIsNotDirty'));
});
