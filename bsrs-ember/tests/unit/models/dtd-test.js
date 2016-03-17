import Ember from 'ember';
const { run } = Ember;
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import { dtd_payload, dtd_payload_link } from 'bsrs-ember/tests/helpers/payloads/dtd';
import DTD from 'bsrs-ember/vendor/defaults/dtd';
import DTDL from 'bsrs-ember/vendor/defaults/dtd-link';
import LINK from 'bsrs-ember/vendor/defaults/link';
import TP from 'bsrs-ember/vendor/defaults/ticket-priority';
import TS from 'bsrs-ember/vendor/defaults/status';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import FD from 'bsrs-ember/vendor/defaults/field';
import OD from 'bsrs-ember/vendor/defaults/option';

var store, dtd, link, priority, status, field, option, uuid;

module('unit: dtd test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:dtd', 'model:dtd-link', 'model:link', 'model:ticket-priority', 'model:ticket-status', 'model:field', 'model:dtd-field', 'model:option', 'model:field-option', 'service:i18n']);
        run(() => {
            dtd = store.push('dtd', {id: DTD.idOne, dtd_link_fks: [DTDL.idOne]});
            store.push('dtd-link', {id: DTDL.idOne, dtd_pk: DTD.idOne, link_pk: LINK.idOne});
            link = store.push('link', {id: LINK.idOne});
            field = store.push('field', {id: FD.idOne, required: FD.requiredOne});
        });
    }
});

test('dtd_link_ids', (assert) => {
    assert.equal(dtd.get('dtd_link_ids').length, 1);
    assert.equal(LINK.idOne, dtd.get('dtd_link_ids')[0], 'x');
});

/* DTD-LINK M2M: START */

// Link
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

// Field
test('m2m dtd-field returns correct field models', (assert) => {
    assert.equal(dtd.get('fields').get('length'), 0);
    run(() => {
        dtd = store.push('dtd', {id: DTD.idOne, dtd_field_fks: [1]});
        store.push('dtd-field', {id: 1, dtd_pk: DTD.idOne, field_pk: FD.idOne});
        field = store.push('field', {id: FD.idOne});
    });
    assert.equal(dtd.get('dtd_fields').get('length'), 1);
    assert.equal(dtd.get('dtd_fields').objectAt(0).get('id'), 1);
    assert.equal(dtd.get('fields').get('length'), 1);
    assert.equal(dtd.get('fields').objectAt(0).get('id'), FD.idOne);
    // remove
    run(() => {
        store.push('dtd-field', {id: 1, removed: true});
    });
    assert.equal(dtd.get('fields').get('length'), 0);
});

/* DTD-LINK M2M: END */

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

// NOTE: Failing b/c 'linkIsDirtyContainer' has been removed from 'isDirtyOrRelatedDirty'
test('dtd is dirty when link is removed', (assert) => {
    assert.equal(dtd.get('links').objectAt(0).get('id'), LINK.idOne);
    assert.equal(dtd.get('links').get('length'), 1);
    dtd.remove_link(link.get('id'));
    assert.equal(dtd.get('links').get('length'), 0);
});

test('add_link dtd is dirty when link is added', (assert) => {
    assert.equal(dtd.get('links').objectAt(0).get('id'), LINK.idOne);
    assert.equal(dtd.get('links').get('length'), 1);
    dtd.add_link({id: LINK.idTwo});
    assert.equal(dtd.get('links').get('length'), 2);
});

// Fields

test('field relationship is setup correctly', (assert) => {
    assert.ok(!field.get('field'));
    run(() => {
        field = store.push('field', {id: FD.idOne, field_field_fks: [1]});
        store.push('dtd-field', {id: 1, dtd_pk: DTD.idOne, field_pk: FD.idOne});
    });
    assert.equal(dtd.get('dtd_fields').get('length'), 1);
    assert.equal(dtd.get('dtd_fields').objectAt(0).get('id'), 1);
    assert.equal(dtd.get('fields').get('length'), 1);
    assert.equal(dtd.get('fields').objectAt(0).get('id'), FD.idOne);
});

test('add_field', (assert) => {
    assert.equal(dtd.get('fields').get('length'), 0);
    assert.ok(dtd.get('fieldsIsNotDirty'));
    assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
    dtd.add_field({id: FD.idOne});
    assert.equal(dtd.get('fields').get('length'), 1);
    assert.ok(dtd.get('fieldsIsDirty'));
    assert.ok(dtd.get('isDirtyOrRelatedDirty'));
});

test('remove_field', (assert) => {
    run(() => {
        dtd = store.push('dtd', {id: DTD.idOne, dtd_field_fks: [1]});
        store.push('dtd-field', {id: 1, dtd_pk: DTD.idOne, field_pk: FD.idOne});
    });
    assert.equal(dtd.get('fields').get('length'), 1);
    assert.ok(dtd.get('fieldsIsNotDirty'));
    assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
    dtd.remove_field(FD.idOne);
    assert.equal(dtd.get('fields').get('length'), 0);
    assert.ok(dtd.get('fieldsIsDirty'));
    assert.ok(dtd.get('isDirtyOrRelatedDirty'));
});

test('save - for Links and their Status and Priority', (assert) => {
    run(() => {
        store.push('ticket-priority', {id: TP.priorityOneId});
        store.push('ticket-status', {id: TD.statusOneId});
    });
    assert.equal(dtd.get('links').objectAt(0).get('id'), LINK.idOne);
    dtd.remove_link(link.get('id'));
    assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(dtd.get('links').get('length'), 0);
    assert.ok(dtd.get('linksIsNotDirty'));
    assert.ok(dtd.get('linksIsDirtyContainer'));
    dtd.save();
    // Links
    assert.ok(dtd.get('linksIsNotDirty'));
    assert.ok(!dtd.get('linksIsDirtyContainer'));
    assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
    dtd.add_link({id: LINK.idTwo});
    assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(dtd.get('links').get('length'), 1);
    assert.equal(dtd.get('links').objectAt(0).get('id'), LINK.idTwo);
    // priority
    priority = store.find('ticket-priority', TP.priorityOneId);
    assert.deepEqual(priority.get('links'), undefined);
    let link_two = store.find('link', LINK.idTwo);
    link_two.change_priority(priority.get('id'));
    assert.deepEqual(priority.get('links'), [LINK.idTwo]);
    assert.equal(dtd.get('links').objectAt(0).get('priority.id'), TP.priorityOneId);
    assert.ok(dtd.get('isDirtyOrRelatedDirty'));
    // status
    status = store.find('ticket-status', TD.statusOneId);
    assert.deepEqual(status.get('links'), undefined);
    link_two = store.find('link', LINK.idTwo);
    link_two.change_status(status.get('id'));
    assert.deepEqual(status.get('links'), [LINK.idTwo]);
    assert.equal(dtd.get('links').objectAt(0).get('status.id'), TD.statusOneId);
    // assertions
    assert.ok(dtd.get('isDirtyOrRelatedDirty'));
    assert.ok(link_two.get('isDirtyOrRelatedDirty'));
    assert.ok(link_two.get('priorityIsDirty'));
    assert.ok(link_two.get('statusIsDirty'));
    dtd.save();
    assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
    assert.ok(link_two.get('isNotDirtyOrRelatedNotDirty'));
    assert.ok(link_two.get('priorityIsNotDirty'));
    assert.ok(link_two.get('statusIsNotDirty'));
});

test('save - Fields and Options', (assert) => {
    assert.equal(dtd.get('fields').get('length'), 0);
    dtd.add_field({id: FD.idOne});
    assert.equal(dtd.get('fields').get('length'), 1);
    assert.ok(dtd.get('fieldsIsDirty'));
    assert.ok(dtd.get('isDirtyOrRelatedDirty'));
    dtd.save();
    assert.ok(dtd.get('fieldsIsNotDirty'));
    assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
    field = dtd.get('fields').objectAt(0);
    assert.equal(field.get('options').get('length'), 0);
    run(() => {
        option = store.push('option', {id: OD.idOne});
    });
    field.add_option({id: OD.idOne});
    assert.equal(field.get('options').get('length'), 1);
    assert.ok(dtd.get('fieldsIsDirty'));
    assert.ok(dtd.get('isDirtyOrRelatedDirty'));
    dtd.save();
    assert.ok(dtd.get('fieldsIsNotDirty'));
    assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
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
        store.push('dtd', {id: DTD.idTwo, destination_links: [LINK.idOne]});
        link = store.push('link', {
            id: LINK.idOne, 
            order: LINK.orderOne,
            action_button: LINK.action_buttonOne,
            is_header: LINK.is_headerOne,
            request: LINK.requestOne,
            text: LINK.textOne,
            priority_fk: TP.priorityOneId,
            status_fk: TD.statusOneId,
            destination_fk: DTD.idTwo
        });
    });
    assert.equal(dtd.get('links').objectAt(0).get('id'), LINK.idOne);
    let payload;
    run(() => {
        payload = dtd.serialize();
    });
    assert.equal(link.get('id'), dtd_payload.links[0].id);
    assert.equal(link.get('priority.id'), dtd_payload.links[0].priority);
    assert.equal(link.get('status.id'), dtd_payload.links[0].status);
    assert.equal(link.get('destination.id'), dtd_payload.links[0].destination);
});

test('scott rollback for related links', (assert) => {
    assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
    assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
    run(() => {
        store.push('link', {id: LINK.idOne, request: LINK.requestTwo});
    });
    assert.ok(link.get('isDirty'));
    assert.ok(link.get('isDirtyOrRelatedDirty'));
    assert.ok(dtd.get('isDirtyOrRelatedDirty'));
    dtd.rollback();
    assert.ok(link.get('isNotDirty'));
    assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
    assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
});

test('rollback for related links priority', (assert) => {
    assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
    assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
    run(() => {
        priority = store.push('ticket-priority', {id: TP.priorityOneId, links: [LINK.idOne]});
        link = store.push('link', {id: LINK.idOne});
    });
    assert.ok(link.get('isNotDirty'));
    assert.ok(link.get('isDirtyOrRelatedDirty'));
    dtd.rollback();
    assert.ok(link.get('isNotDirty'));
    assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
    assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
});

test('rollback for related fields', (assert) => {
    assert.ok(dtd.get('fieldsIsNotDirty'));
    assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(dtd.get('fields').get('length'), 0);
    dtd.add_field({id: FD.idOne});
    assert.equal(dtd.get('fields').get('length'), 1);
    field = dtd.get('fields').objectAt(0);
    assert.ok(field.get('isNotDirty'));
    store.push('field', {id: FD.idOne, required: FD.requiredTwo});
    assert.ok(field.get('isDirty'));
    assert.ok(dtd.get('fieldsIsDirty'));
    assert.ok(dtd.get('isDirtyOrRelatedDirty'));
    dtd.rollback();
    assert.equal(dtd.get('fields').get('length'), 0);
    assert.ok(dtd.get('fieldsIsNotDirty'));
    assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(store.find('field').get('length'), 1);
    field = store.findOne('field');
    assert.ok(field.get('isNotDirty'));
});

test('rollback for related fields and their options', (assert) => {
    assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(dtd.get('fields').get('length'), 0);
    dtd.add_field({id: FD.idOne});
    assert.equal(dtd.get('fields').get('length'), 1);
    assert.ok(dtd.get('fieldsIsDirty'));
    assert.ok(dtd.get('isDirtyOrRelatedDirty'));
    // Add an Option to the Field
    field = dtd.get('fields').objectAt(0);
    field.add_option({id: OD.idOne});
    assert.ok(field.get('isDirtyOrRelatedDirty'));
    assert.ok(field.get('optionsIsDirty'));
    assert.ok(dtd.get('isDirtyOrRelatedDirty'));
    assert.ok(field.get('options').objectAt(0).get('isNotDirty'));
    run(() => {
        store.push('option', {id: OD.idOne, text: OD.textOne});
    });
    assert.ok(field.get('options').objectAt(0).get('isDirty'));
    dtd.rollback();
    assert.equal(dtd.get('fields').get('length'), 0);
    assert.ok(field.get('isNotDirtyOrRelatedNotDirty'));
    assert.ok(field.get('optionsIsNotDirty'));
    assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(field.get('options').get('length'), 0);
    assert.equal(store.find('option').get('length'), 1);
    assert.ok(store.findOne('option').get('isNotDirty'));
});

test('save and rollback combined test', (assert) => {
    assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
    dtd.add_field({id: FD.idOne});
    assert.equal(dtd.get('fields').get('length'), 1);
    dtd.add_link({id: LINK.idTwo});
    assert.equal(dtd.get('links').get('length'), 2);
    link = dtd.get('links').objectAt(0);
    link.change_priority(TP.idOne);
    assert.equal(link.get('priority.id'), TP.idOne);
    link.change_status(TS.idOne);
    assert.equal(link.get('status.id'), TS.idOne);
    assert.ok(dtd.get('linksIsNotDirty'));
    assert.ok(dtd.get('fieldsIsDirty'));
    assert.ok(dtd.get('isDirtyOrRelatedDirty'));
    dtd.save();
    assert.ok(dtd.get('linksIsNotDirty'));
    assert.ok(dtd.get('fieldsIsNotDirty'));
    assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
    // rollback
    dtd.add_field({id: FD.idTwo});
    assert.equal(dtd.get('fields').get('length'), 2);
    dtd.remove_link(LINK.idOne);
    assert.equal(dtd.get('links').get('length'), 1);
    link.change_priority(TP.idTwo);
    assert.equal(link.get('priority.id'), TP.idTwo);
    link.change_status(TS.idTwo);
    assert.equal(link.get('status.id'), TS.idTwo);
    assert.ok(dtd.get('linksIsNotDirty'));
    assert.ok(dtd.get('fieldsIsDirty'));
    assert.ok(dtd.get('isDirtyOrRelatedDirty'));
    dtd.rollback();
    assert.equal(dtd.get('fields').get('length'), 1);
    assert.equal(dtd.get('links').get('length'), 2);
    assert.equal(link.get('priority.id'), TP.idOne);
    assert.equal(link.get('status.id'), TS.idOne);
    assert.ok(dtd.get('linksIsNotDirty'));
    assert.ok(dtd.get('fieldsIsNotDirty'));
    assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
});
