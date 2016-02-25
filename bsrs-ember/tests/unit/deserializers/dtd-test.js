import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import DTDF from 'bsrs-ember/vendor/dtd_fixtures';
import DTD from 'bsrs-ember/vendor/defaults/dtd';
import DTDDeserializer from 'bsrs-ember/deserializers/dtd';

var store, subject, category, category_unused, run = Ember.run;

module('unit: dtd deserializer test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:dtd', 'model:dtd-list']);
        subject = DTDDeserializer.create({store: store});
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
