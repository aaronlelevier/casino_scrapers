import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import DTDF from 'bsrs-ember/vendor/dtd_fixtures';
import DTD from 'bsrs-ember/vendor/defaults/dtd';
import FD from 'bsrs-ember/vendor/defaults/field';
import OD from 'bsrs-ember/vendor/defaults/option';
import DTDL from 'bsrs-ember/vendor/defaults/dtd-link';
import LINK from 'bsrs-ember/vendor/defaults/link';
import DTDDeserializer from 'bsrs-ember/deserializers/dtd';
import TP from 'bsrs-ember/vendor/defaults/ticket-priority';
import TD from 'bsrs-ember/vendor/defaults/ticket';

var store, subject, category, category_unused, dtd, dtd_link, priority, status, run = Ember.run;

module('unit: dtd deserializer test', {
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:dtd', 'model:dtd-link', 'model:link', 'model:dtd-field', 'model:field', 'model:option', 'model:field-option', 'model:link-priority-list', 'model:ticket-priority', 'model:ticket-status', 'service:i18n']);
    subject = DTDDeserializer.create({store: store});
    run(() => {
      priority = store.push('ticket-priority', {id: TP.priorityOneId, name: TP.priorityOne});
      status = store.push('ticket-status', {id: TD.statusOneId, name: TD.statusOne});
    });
  }
});

// List

test('dtd deserializer returns correct data', (assert) => {
  const json = [DTDF.generate_list(DTD.idOne), DTDF.generate_list(DTD.idTwo)];
  const response = {'count':2,'next':null,'previous':null,'results': json};
  run(() => {
    subject.deserialize(response);
  });
  let dtds = store.find('dtd');
  assert.equal(dtds.get('length'), 2);
  let dtd = store.find('dtd', DTD.idOne);
  assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(dtd.get('key'), DTD.keyOne);
  assert.equal(dtd.get('description'), DTD.descriptionOne);
  let dtd_two = store.find('dtd', DTD.idTwo);
  assert.ok(dtd_two.get('isNotDirtyOrRelatedNotDirty'));
});

// Single

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
  // links
  assert.equal(dtd.get('link'), undefined);
  assert.equal(dtd.get('links').get('length'), 1);
  assert.equal(dtd.get('links').objectAt(0).get('id'), LINK.idOne);
  assert.equal(dtd.get('links').objectAt(0).get('request'), LINK.requestOne);
  assert.equal(dtd.get('dtd_links').get('length'), 1);
  assert.equal(dtd.get('dtd_link_fks').length, 1);
  // fields
  assert.equal(dtd.get('fields').get('length'), 1);
  let field = dtd.get('fields').objectAt(0);
  assert.equal(field.get('id'), FD.idOne);
  assert.equal(field.get('label'), FD.labelOne);
  assert.equal(field.get('type'), FD.typeSix);
  assert.equal(field.get('required'), FD.requiredOne);
  assert.equal(field.get('order'), FD.orderOne);
  // options
  assert.equal(dtd.get('fields').objectAt(0).get('options').get('length'), 1);
  let option = dtd.get('fields').objectAt(0).get('options').objectAt(0);
  assert.equal(option.get('id'), OD.idOne);
  assert.equal(option.get('text'), OD.textOne);
  assert.equal(option.get('order'), OD.orderOne);
});

test('dtd deserializer removes m2m dtd-link when server is diff from client', (assert) => {
  const json = DTDF.generate(DTD.idOne);
  assert.ok(json.fields);
  let dtd, dtd_link;
  run(() => {
    dtd = store.push('dtd', {id: DTD.idOne, dtd_link_fks: [DTDL.idOne]});
    store.push('link', {id: LINK.idTwo});
    dtd_link = store.push('dtd-link', {id: DTDL.idOne, dtd_pk: DTD.idOne, link_pk: LINK.idTwo});
  });
  assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(dtd.get('fields').get('length'), 0);
  run(() => {
    subject.deserialize(json, DTD.idOne);
  });
  dtd = store.find('dtd', DTD.idOne);
  assert.equal(dtd.get('dtd_links').get('length'), 1);
  let m2m = store.find('dtd-link', DTDL.idOne);
  assert.ok(m2m.get('removed'));
  assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(dtd.get('fields').get('length'), 1);
  assert.equal(dtd.get('fields').objectAt(0).get('options').get('length'), 1);
});

test('dtd new definitions from server will not dirty model if clean', (assert) => {
  run(() => {
    dtd = store.push('dtd', {id: DTD.idOne, dtd_link_fks: [DTDL.idOne]});
    store.push('link', {id: LINK.idTwo});
    dtd_link = store.push('dtd-link', {id: DTDL.idOne, dtd_pk: DTD.idOne, link_pk: LINK.idTwo});
  });
  const json = DTDF.generate(DTD.idOne, DTD.keyTwo);
  run(() => {
    subject.deserialize(json, DTD.idOne);
  });
  let dtd = store.find('dtd', DTD.idOne);
  assert.equal(dtd.get('links').objectAt(0).get('id'), LINK.idOne);
  assert.equal(dtd.get('key'), DTD.keyTwo);
  assert.ok(dtd.get('isNotDirty'));
});

test('dtd isDirty, so the deserializer wont override store data', assert => {
  const json = DTDF.generate(DTD.idOne);
  assert.ok(json.fields);
  run(() => {
    dtd = store.push('dtd', {id: DTD.idOne, dtd_link_fks: [DTDL.idOne]});
    store.push('link', {id: LINK.idTwo});
    store.push('dtd-link', {id: DTDL.idOne, dtd_pk: DTD.idOne, link_pk: LINK.idTwo});
  });
  assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(dtd.get('fields').get('length'), 0);
  store.push('dtd', {id: DTD.idOne, key: DTD.keyTwo});
  assert.ok(dtd.get('isDirtyOrRelatedDirty'));
  run(() => {
    subject.deserialize(json, DTD.idOne);
  });
  assert.equal(dtd.get('fields').get('length'), 0);
  assert.ok(dtd.get('isDirtyOrRelatedDirty'));
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

test('status gets extracted', (assert) => {
  const json = DTDF.generate(DTD.idOne);
  run(() => {
    subject.deserialize(json, DTD.idOne);
  });
  let dtd = store.find('dtd', DTD.idOne);
  assert.equal(dtd.get('links').objectAt(0).get('status_fk'), TD.statusOneId);
  assert.equal(dtd.get('links').objectAt(0).get('status.id'), TD.statusOneId);
  assert.equal(dtd.get('links').objectAt(0).get('status.name'), TD.statusOne);
});

test('status gets extracted', (assert) => {
  const json = DTDF.generate(DTD.idOne);
  run(() => {
    subject.deserialize(json, DTD.idOne);
  });
  let dtd = store.find('dtd', DTD.idOne);
  assert.equal(dtd.get('links').objectAt(0).get('destination_fk'), DTD.idTwo);
  assert.ok(dtd.get('links').objectAt(0).get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(dtd.get('links').objectAt(0).get('destination.id'), DTD.idTwo);
});

test('dtd has fields, but no options', assert => {
  const json = DTDF.generate(DTD.idOne);
  assert.equal(json.fields.length, 1);
  assert.equal(json.fields[0].options.length, 1);
  json.fields[0].options.pop();
  assert.equal(json.fields[0].options.length, 0);
  run(() => {
    subject.deserialize(json, DTD.idOne);
  });
  dtd = store.find('dtd', DTD.idOne);
  assert.equal(dtd.get('id'), DTD.idOne);
  assert.equal(dtd.get('fields').get('length'), 1);
  assert.equal(dtd.get('fields').objectAt(0).get('options').get('length'), 0);
});

test('dtd has no fields', assert => {
  const json = DTDF.generate(DTD.idOne);
  assert.equal(json.fields.length, 1);
  json.fields.pop();
  assert.equal(json.fields.length, 0);
  run(() => {
    subject.deserialize(json, DTD.idOne);
  });
  dtd = store.find('dtd', DTD.idOne);
  assert.equal(dtd.get('id'), DTD.idOne);
  assert.equal(dtd.get('fields').get('length'), 0);
});

/* DESTINATION */
test('dtd link has a destination', assert => {
  const json = DTDF.generate(DTD.idOne);
  run(() => {
    subject.deserialize(json, DTD.idOne);
  });
  dtd = store.find('dtd', DTD.idOne);
  assert.equal(dtd.get('id'), DTD.idOne);
  assert.equal(dtd.get('links').objectAt(0).get('destination.id'), DTD.idTwo);
});

test('dtd link has no destination', assert => {
  const json = DTDF.generate(DTD.idOne);
  delete json.links[0].destination;
  run(() => {
    subject.deserialize(json, DTD.idOne);
  });
  dtd = store.find('dtd', DTD.idOne);
  assert.equal(dtd.get('id'), DTD.idOne);
  assert.equal(dtd.get('links').objectAt(0).get('destination.id'), undefined);
});

test('dtd link gets updated destination from server', assert => {
  let dtd;
  run(() => {
    dtd = store.push('dtd', {id: DTD.idOne, destination_links: [LINK.idTwo], dtd_link_fks: [DTDL.idOne]});
    store.push('link', {id: LINK.idTwo, destination_fk: DTD.idOne});
    store.push('dtd', {id: DTD.idTwo});
    store.push('dtd-link', {id: DTDL.idOne, dtd_pk: DTD.idOne, link_pk: LINK.idTwo});
  });
  assert.equal(dtd.get('links').get('length'), 1);
  assert.equal(dtd.get('links').objectAt(0).get('destination_fk'), DTD.idOne);
  assert.equal(dtd.get('links').objectAt(0).get('destination.id'), DTD.idOne);
  assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
  const json = DTDF.generate(DTD.idOne);
  json.links[0].destination_fk = DTD.idThree;
  run(() => {
      subject.deserialize(json, DTD.idOne);
  });
  dtd = store.find('dtd', DTD.idOne);
  assert.equal(dtd.get('id'), DTD.idOne);
  assert.equal(dtd.get('links').objectAt(0).get('destination.id'), DTD.idTwo);
  assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
});

test('dtd link that is dirty gets ignores destination from server', assert => {
  let dtd;
  run(() => {
    dtd = store.push('dtd', {id: DTD.idOne, dtd_link_fks: [DTDL.idOne]});
    store.push('link', {id: LINK.idTwo, destination_fk: DTD.idOne});
    store.push('dtd', {id: DTD.idTwo, destination_links: [LINK.idTwo]});
    store.push('dtd-link', {id: DTDL.idOne, dtd_pk: DTD.idOne, link_pk: LINK.idTwo});
  });
  assert.equal(dtd.get('links').get('length'), 1);
  assert.equal(dtd.get('links').objectAt(0).get('destination_fk'), DTD.idOne);
  assert.equal(dtd.get('links').objectAt(0).get('destination.id'), DTD.idTwo);
  assert.ok(dtd.get('isDirtyOrRelatedDirty'));
  const json = DTDF.generate(DTD.idOne);
  run(() => {
      subject.deserialize(json, DTD.idOne);
  });
  dtd = store.find('dtd', DTD.idOne);
  assert.equal(dtd.get('id'), DTD.idOne);
  assert.equal(dtd.get('links').objectAt(0).get('destination.id'), DTD.idTwo);
  assert.equal(dtd.get('links').objectAt(0).get('destination_fk'), DTD.idOne);
  assert.ok(dtd.get('isDirtyOrRelatedDirty'));
});
