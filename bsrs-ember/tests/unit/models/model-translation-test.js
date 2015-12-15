import {test, module} from 'bsrs-ember/tests/helpers/i18n/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import LDS from 'bsrs-ember/vendor/defaults/location-status';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import CD from 'bsrs-ember/vendor/defaults/category';

var store;

module('unit: model translation test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:category', 'model:ticket-priority', 'model:ticket-status', 'model:location-status', 'service:i18n']);
    }
});

test('category translated name returns correct value', (assert) => {
    let category = store.push('category', {id: 1, name: ''});
    assert.equal(category.get('translated_name'), '');
    category.set('name', CD.nameRepairKey);
    assert.equal(category.get('translated_name'), CD.nameSolo);
});

test('ticket-priority translated name returns correct value', (assert) => {
    let priority = store.push('ticket-priority', {id: 1, name: ''});
    assert.equal(priority.get('translated_name'), '');
    priority.set('name', TD.priorityTwoKey);
    assert.equal(priority.get('translated_name'), TD.priorityTwo);
});

test('ticket-status translated name returns correct value', (assert) => {
    let status = store.push('ticket-status', {id: 1, name: ''});
    assert.equal(status.get('translated_name'), '');
    status.set('name', TD.statusSevenKey);
    assert.equal(status.get('translated_name'), TD.statusSeven);
});

test('location-status translated name returns correct value', (assert) => {
    let status = store.push('location-status', {id: 1, name: ''});
    assert.equal(status.get('translated_name'), '');
    status.set('name', LDS.openName);
    assert.equal(status.get('translated_name'), LDS.openNameTranslated);
});
