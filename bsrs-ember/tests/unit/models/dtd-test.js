import Ember from 'ember';
const { run } = Ember;
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import { dtd_payload, dtd_payload_link } from 'bsrs-ember/tests/helpers/payloads/dtd';
import DTD from 'bsrs-ember/vendor/defaults/dtd';
import DTDL from 'bsrs-ember/vendor/defaults/dtd-link';
import LINK from 'bsrs-ember/vendor/defaults/link';
import TP from 'bsrs-ember/vendor/defaults/ticket-priority';
import TD from 'bsrs-ember/vendor/defaults/ticket';

var store, dtd, link, priority, status, uuid;

module('unit: dtd test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:dtd', 'model:dtd-link', 'model:link', 'model:ticket-priority', 'model:ticket-status', 'service:i18n']);
        run(() => {
            dtd = store.push('dtd', {id: DTD.idOne, dtd_link_fks: [DTDL.idOne]});
            store.push('dtd-link', {id: DTDL.idOne, dtd_pk: DTD.idOne, link_pk: LINK.idOne});
            link = store.push('link', {id: LINK.idOne});
        });
    }
});

test('dtd_link_ids', (assert) => {
    assert.equal(dtd.get('dtd_link_ids').length, 1);
    assert.equal(LINK.idOne, dtd.get('dtd_link_ids')[0], 'x'); // DTDL.idOne);
});

/* DTD-LINK M2M: START */
test('m2m dtd-link returns correct link models', (assert) => {
    run(() => {
        store.push('dtd-link', {id: DTDL.idTwo, dtd_pk: DTD.idTwo, link_pk: LINK.idTwo});
        store.push('link', {id: LINK.idTwo});
    });
    assert.equal(dtd.get('dtd_links').get('length'), 1);
    assert.equal(dtd.get('dtd_links').objectAt(0).get('id'), DTDL.idOne);
    assert.equal(dtd.get('links').get('length'), 1);
    assert.equal(dtd.get('links').objectAt(0).get('id'), LINK.idOne);
});

test('m2m dtd-link returns update link models after m2m is removed', (assert) => {
    assert.equal(dtd.get('dtd_links').get('length'), 1);
    assert.equal(dtd.get('dtd_links').objectAt(0).get('id'), DTDL.idOne);
    assert.equal(dtd.get('links').get('length'), 1);
    assert.equal(dtd.get('links').objectAt(0).get('id'), LINK.idOne);
    run(() => {
        store.push('dtd-link', {id: DTDL.idOne, removed: true});
    });
    assert.equal(dtd.get('dtd_links').get('length'), 0);
    assert.equal(dtd.get('links').get('length'), 0);
});

test('the dtd model is dirty when you change a links request', (assert) => {
    assert.ok(!link.get('isDirty'));
    run(() => {
        store.push('link', {id: LINK.idOne, request: LINK.requestOne});
    });
    assert.ok(link.get('isDirty'));
    assert.ok(dtd.get('linksIsDirty'));
    assert.ok(dtd.get('isDirtyOrRelatedDirty'));
});

test('dtd is dirty when priority is changed on link model', (assert) => {
    assert.ok(!dtd.get('isDirtyOrRelatedDirty'));
    assert.ok(!link.get('priority'));
    run(() => {
        priority = store.push('ticket-priority', {id: TP.priorityOneId, links: [LINK.idOne]});
        link = store.push('link', {id: LINK.idOne, priority_fk: TP.priorityOneId});
    });
    assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
    assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
    run(() => {
        priority = store.push('ticket-priority', {id: TP.priorityOneId, links: []});
        priority = store.push('ticket-priority', {id: TP.priorityTwoId, links: [LINK.idOne]});
    });
    assert.equal(link.get('priority').get('id'), TP.priorityTwoId);
    assert.ok(dtd.get('isDirtyOrRelatedDirty'));
    assert.ok(link.get('isDirtyOrRelatedDirty'));
});

test('dtd is dirty from priority cache breaking', (assert) => {
    run(() => {
        priority = store.push('ticket-priority', {id: TP.priorityOneId, links: [LINK.idOne]});
        link = store.push('link', {id: LINK.idOne, priority_fk: TP.priorityOneId});
    });
    assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
    run(() => {
        priority = store.push('ticket-priority', {id: TP.priorityOneId, links: []});
        priority = store.push('ticket-priority', {id: TP.priorityTwoId, links: [LINK.idOne]});
    });
    assert.ok(dtd.get('isDirtyOrRelatedDirty'));
});

test('dtd is dirty when link is removed', (assert) => {
    assert.equal(dtd.get('links').objectAt(0).get('id'), LINK.idOne);
    dtd.remove_link(link.get('id'));
    assert.ok(dtd.get('isDirtyOrRelatedDirty'));
    assert.equal(dtd.get('links').get('length'), 0);
});

test('add_link dtd is dirty when link is added', (assert) => {
    assert.equal(dtd.get('links').objectAt(0).get('id'), LINK.idOne);
    dtd.add_link({id: LINK.idTwo});
    assert.ok(dtd.get('isDirtyOrRelatedDirty'));
    assert.equal(dtd.get('links').get('length'), 2);
});

/* DTD-LINK M2M: END */

test('saveRelated', (assert) => {
    run(() => {
        store.push('ticket-priority', {id: TP.priorityOneId});
    });
    assert.equal(dtd.get('links').objectAt(0).get('id'), LINK.idOne);
    dtd.remove_link(link.get('id'));
    assert.ok(dtd.get('isDirtyOrRelatedDirty'));
    assert.equal(dtd.get('links').get('length'), 0);
    assert.ok(dtd.get('linksIsDirty'));
    assert.ok(dtd.get('linksIsDirtyContainer'));
    dtd.saveRelated();
    assert.ok(dtd.get('linksIsNotDirty'));
    assert.ok(!dtd.get('linksIsDirtyContainer'));
    assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
    dtd.add_link({id: LINK.idTwo});
    assert.ok(dtd.get('isDirtyOrRelatedDirty'));
    assert.equal(dtd.get('links').get('length'), 1);
    assert.equal(dtd.get('links').objectAt(0).get('id'), LINK.idTwo);
    priority = store.find('ticket-priority', TP.priorityOneId);
    assert.deepEqual(priority.get('links'), undefined);
    let link_two = store.find('link', LINK.idTwo);
    link_two.change_priority(priority.get('id'));
    assert.deepEqual(priority.get('links'), [LINK.idTwo]);
    assert.equal(dtd.get('links').objectAt(0).get('priority.id'), TP.priorityOneId);
    assert.ok(dtd.get('isDirtyOrRelatedDirty'));
    assert.ok(link_two.get('isDirtyOrRelatedDirty'));
    assert.ok(link_two.get('priorityIsDirty'));
    dtd.saveRelated();
    assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
    assert.ok(link_two.get('isNotDirtyOrRelatedNotDirty'));
    assert.ok(link_two.get('priorityIsNotDirty'));
});

test('serialize dtd model and links with a priority', (assert) => {
    run(() => {
        dtd = store.push('dtd', {
            id: DTD.idOne,
            key: DTD.keyOne,
            description: DTD.descriptionOne,
            prompt: DTD.promptOne,
            note: DTD.noteOne,
            note_type: DTD.noteTypeOne,
            link_type: DTD.linkTypeOne
        });
        priority = store.push('ticket-priority', {id: TP.priorityOneId, links: [LINK.idOne]});
        status = store.push('ticket-status', {id: TD.statusOneId, name: TD.statusOne, links: [LINK.idOne]});
        link = store.push('link', {
            id: LINK.idOne, 
            order: LINK.orderOne,
            action_button: LINK.action_buttonOne,
            is_header: LINK.is_headerOne,
            request: LINK.requestOne,
            text: LINK.textOne,
            priority_fk: TP.priorityOneId,
            status_fk: TD.statusOneId
        });
    });
    assert.equal(dtd.get('links').objectAt(0).get('id'), LINK.idOne);
    let payload = dtd.serialize();
    assert.deepEqual(payload, dtd_payload);
});

test('rollbackRelated for related links', (assert) => {
    assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
    assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
    run(() => {
        store.push('link', {id: LINK.idOne, request: LINK.requestTwo});
    });
    assert.ok(link.get('isDirty'));
    assert.ok(link.get('isDirtyOrRelatedDirty'));
    dtd.rollbackRelated();
    assert.ok(link.get('isNotDirty'));
    assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
    assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
});

test('rollbackRelated for related links priority', (assert) => {
    assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
    assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
    run(() => {
        priority = store.push('ticket-priority', {id: TP.priorityOneId, links: [LINK.idOne]});
        link = store.push('link', {id: LINK.idOne});
    });
    assert.ok(link.get('isNotDirty'));
    assert.ok(link.get('isDirtyOrRelatedDirty'));
    dtd.rollbackRelated();
    assert.ok(link.get('isNotDirty'));
    assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
    assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
});
