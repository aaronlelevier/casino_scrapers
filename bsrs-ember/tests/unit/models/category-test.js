import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import TICKET_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket';
import PEOPLE_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import CATEGORY_DEFAULTS from 'bsrs-ember/vendor/defaults/category';
import TICKET_PERSON_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket-person';
import TICKET_CATEGORY_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket-category';

var store;

module('unit: ticket test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:category']);
    }
});

test('parent category returns associated model or undefined', (assert) => {
    let category = store.push('category', {id: 1, parent_id: 2});
    store.push('category', {id: 2, name: 'x', parent_id: null});
    let parent = category.get('parent');
    assert.equal(parent.get('id'), 2);
    assert.equal(parent.get('name'), 'x');
    category.set('parent_id', null);
    parent = category.get('parent');
    assert.equal(parent, undefined);
});
