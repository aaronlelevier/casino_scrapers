import Ember from 'ember';
const { run } = Ember;
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import DTD from 'bsrs-ember/vendor/defaults/dtd';

var store, dtd;

module('unit: dtd test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:dtd']);
        run(() => {
        });
    }
});

test('dtd key field is dirty trackable', (assert) => {
    dtd = store.push('dtd', {id: DTD.idOne});
    dtd.set('key', 'wat');
    assert.ok(dtd.get('isDirty'));
    assert.ok(dtd.get('isDirtyOrRelatedDirty'));
    dtd.set('key', '');
    assert.ok(dtd.get('isNotDirty'));
    assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
});

test('dtd description field is dirty trackable', (assert) => {
    dtd = store.push('dtd', {id: DTD.idOne});
    dtd.set('description', 'wat');
    assert.ok(dtd.get('isDirty'));
    dtd.set('description', '');
    assert.ok(dtd.get('isNotDirty'));
});

test('dtd note field is dirty trackable', (assert) => {
    dtd = store.push('dtd', {id: DTD.idOne});
    dtd.set('note', 'wat');
    assert.ok(dtd.get('isDirty'));
    dtd.set('note', '');
    assert.ok(dtd.get('isNotDirty'));
});

test('dtd note_type field is dirty trackable', (assert) => {
    dtd = store.push('dtd', {id: DTD.idOne});
    dtd.set('note_type', 'wat');
    assert.ok(dtd.get('isDirty'));
    dtd.set('note_type', '');
    assert.ok(dtd.get('isNotDirty'));
});

test('dtd prompt field is dirty trackable', (assert) => {
    dtd = store.push('dtd', {id: DTD.idOne});
    dtd.set('prompt', 'wat');
    assert.ok(dtd.get('isDirty'));
    dtd.set('prompt', '');
    assert.ok(dtd.get('isNotDirty'));
});

test('dtd link_type field is dirty trackable', (assert) => {
    dtd = store.push('dtd', {id: DTD.idOne});
    dtd.set('link_type', 'wat');
    assert.ok(dtd.get('isDirty'));
    dtd.set('link_type', '');
    assert.ok(dtd.get('isNotDirty'));
});
