import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import DTDF from 'bsrs-ember/vendor/dtd_fixtures';
import DTD from 'bsrs-ember/vendor/defaults/dtd';
import DTDL from 'bsrs-ember/vendor/defaults/dtd-link';
import LINK from 'bsrs-ember/vendor/defaults/link';
import DTDDeserializer from 'bsrs-ember/deserializers/dtd';
import TP from 'bsrs-ember/vendor/defaults/ticket-priority';

var store, subject, category, category_unused, priority, run = Ember.run;

module('unit: dtd deserializer test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:dtd', 'model:dtd-link', 'model:link', 'model:dtd-list', 'model:link-priority-list', 'model:ticket-priority', 'service:i18n']);
        subject = DTDDeserializer.create({store: store});
        run(() => {
            priority = store.push('ticket-priority', {id: TP.priorityOneId, name: TP.priorityOne});
        });
    }
});

test('dtd deserializer returns correct data', (assert) => {
    const json = DTDF.generate(DTD.idOne);
    run(() => {
        subject.deserialize(json, DTD.idOne);
    });
    let dtd = store.find('dtd', DTD.idOne);
    assert.equal(dtd.get('id'), DTD.idOne);
    assert.equal(dtd.get('key'), DTD.keyOne);
    assert.equal(dtd.get('description'), DTD.descriptionOne);
    assert.equal(dtd.get('prompt'), DTD.promptOne);
    assert.equal(dtd.get('note'), DTD.noteOne);
    assert.equal(dtd.get('note_type'), DTD.noteTypeOne);
    assert.equal(dtd.get('link'), undefined);
    assert.equal(dtd.get('links').get('length'), 1);
    assert.equal(dtd.get('links').objectAt(0).get('id'), LINK.idOne);
    assert.equal(dtd.get('links').objectAt(0).get('request'), LINK.requestOne);
    assert.equal(dtd.get('dtd_links').get('length'), 1);
    assert.equal(dtd.get('dtd_link_fks').length, 1);
});

test('dtd deserializer removes m2m dtd-link when server is diff from client', (assert) => {
    const json = DTDF.generate(DTD.idOne);
    let dtd, dtd_link;
    run(() => {
        dtd = store.push('dtd', {id: DTD.idOne, dtd_link_fks: [DTDL.idOne]});
        store.push('link', {id: LINK.idTwo});
        dtd_link = store.push('dtd-link', {id: DTDL.idOne, dtd_pk: DTD.idOne, link_pk: LINK.idTwo});
    });
    assert.ok(dtd.get('linksIsNotDirty'));
    run(() => {
        subject.deserialize(json, DTD.idOne);
    });
    dtd = store.find('dtd', DTD.idOne);
    assert.equal(dtd.get('dtd_links').get('length'), 1);
    let m2m = store.find('dtd-link', DTDL.idOne);
    assert.ok(m2m.get('removed'));
});

test('dtd new definitions from server will not dirty model if clean', (assert) => {
    store.push('dtd', DTDF.generate(DTD.idOne));
    const json = DTDF.generate(DTD.idOne, DTD.keyTwo);
    run(() => {
        subject.deserialize(json, DTD.idOne);
    });
    let dtd = store.find('dtd', DTD.idOne);
    assert.equal(dtd.get('key'), DTD.keyTwo);
    assert.ok(dtd.get('isNotDirty'));
});

test('dtd deserializer returns correct data (list)', (assert) => {
    const json = [DTDF.generate(DTD.idOne), DTDF.generate(DTD.idTwo)];
    const response = {'count':2,'next':null,'previous':null,'results': json};
    run(() => {
        subject.deserialize(response);
    });
    let dtds = store.find('dtd-list');
    assert.equal(dtds.get('length'), 2);
    let dtd = store.find('dtd-list', DTD.idOne);
    assert.equal(dtd.get('id'), DTD.idOne);
    assert.equal(dtd.get('key'), DTD.keyOne);
    assert.equal(dtd.get('description'), DTD.descriptionOne);
    assert.equal(dtd.get('prompt'), DTD.promptOne);
    assert.equal(dtd.get('note'), DTD.noteOne);
    assert.equal(dtd.get('note_type'), DTD.noteTypeOne);
});

test('priority gets extracted', (assert) => {
    const json = DTDF.generate(DTD.idOne);
    run(() => {
        subject.deserialize(json, DTD.idOne);
    });
    let dtd = store.find('dtd', DTD.idOne);
    assert.equal(dtd.get('links').objectAt(0).get('priority_fk'), TP.priorityOneId);
    assert.equal(dtd.get('links').objectAt(0).get('priority.id'), TP.priorityOneId);
    assert.equal(dtd.get('links').objectAt(0).get('priority.name'), TP.priorityOne);
});

test('priority link already has a priority of two', (assert) => {
    let dtd, link;
    run(() => {
        dtd = store.push('dtd', {id: DTD.idOne, dtd_link_fks: [DTDL.idOne]});
        store.push('dtd-link', {id: DTDL.idOne, dtd_pk: DTD.idOne, link_pk: LINK.idOne});
        link = store.push('link', {id: LINK.idOne, priority_fk: TP.priorityTwoId});
        store.push('ticket-priority', {id: TP.priorityTwoId, name: TP.priorityTwo, links: [link.get('id')]});
    });
    assert.equal(dtd.get('links').objectAt(0).get('priority_fk'), TP.priorityTwoId);
    assert.equal(dtd.get('links').objectAt(0).get('priority.id'), TP.priorityTwoId);
    const json = DTDF.generate(DTD.idOne);
    assert.equal(link.get('priority_fk'), TP.priorityTwoId);
    run(() => {
        subject.deserialize(json, DTD.idOne);
    });
    dtd = store.find('dtd', DTD.idOne);
    let links = store.find('link');
    assert.equal(links.get('length'), 1);
    let link_two = store.find('link', LINK.idOne);
    assert.equal(link_two.get('priority_fk'), TP.priorityOneId);
    assert.equal(dtd.get('links').objectAt(0).get('priority_fk'), TP.priorityOneId);
    assert.equal(dtd.get('links').objectAt(0).get('priority.id'), TP.priorityOneId);
    assert.equal(dtd.get('links').objectAt(0).get('priority.name'), TP.priorityOne);
});
