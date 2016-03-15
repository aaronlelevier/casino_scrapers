import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import PEOPLE_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import GridViewFooterComponent from 'bsrs-ember/components/grid/helpers/grid-footer/component';

var proxy = function() {
    return Ember.ArrayProxy.extend({
        content: Ember.computed(function () {
            return Ember.A(this.get('source'));
        }).property()
    }).create({
        source: []
    });
};

var columns = [
    {field: 'fullname', headerLabel: 'Name', isSortable: true, isFilterable: true, isSearchable: true},
    {field: 'username', headerLabel: 'Username', isSortable: true, isFilterable: true, isSearchable: true},
    {field: 'title', headerLabel: 'Title', isSortable: true, isFilterable: true, isSearchable: true}
];

var columns_with_role = [
    {field: 'fullname', headerLabel: 'Name', isSortable: true, isFilterable: true, isSearchable: true},
    {field: 'username', headerLabel: 'Username', isSortable: true, isFilterable: true, isSearchable: true},
    {field: 'title', headerLabel: 'Title', isSortable: true, isFilterable: true, isSearchable: true},
    {field: 'role.name', headerLabel: 'Role', isSortable: true, isFilterable: true, isSearchable: true}
];

var store, eventbus, requested;

module('unit: grid-view-footer test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:person', 'service:eventbus', 'model:role']);
        eventbus = this.container.lookup('service:eventbus');
        requested = proxy();
    }
});

test('given a list of people and page number, should only return those people on that page (4 people)', (assert) => {
    store.push('person', {id: 3, username: 'abc', first_name: '', last_name: ''});
    store.push('person', {id: 1, username: 'def', first_name: '', last_name: ''});
    store.push('person', {id: 2, username: 'zzz', first_name: '', last_name: ''});
    store.push('person', {id: 4, username: 'crb', first_name: '', last_name: ''});
    var model = store.find('person');
    model.set('count', 4);
    requested.pushObject(1);
    var subject = GridViewFooterComponent.create({requested: requested, model: model, page_size: 2, eventbus: eventbus, columns: columns});
    var pages = subject.get('pages');
    assert.equal(pages.get('length'), 2);
    model.set('count', 5);
    store.push('person', {id: 5, username: 'drb'});
    pages = subject.get('pages');
    assert.equal(pages.get('length'), 3);
});

test('rolling pagination shows only ten records at a time', (assert) => {
    for(var i=1; i < 179; i++) {
        store.push('person', {id: i});
    }
    let model = store.find('person');
    model.set('count', 179);
    let subject = GridViewFooterComponent.create({page: 1, model: model, eventbus: eventbus, columns: columns});
    let current = subject.get('page');
    assert.equal(current, 1);
    let pages = subject.get('pages');
    assert.equal(pages.length, 18);
    let shown = subject.get('shown_pages');
    assert.deepEqual(shown, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    subject.set('page', 2);
    shown = subject.get('shown_pages');
    assert.deepEqual(shown, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    subject.set('page', 3);
    shown = subject.get('shown_pages');
    assert.deepEqual(shown, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    subject.set('page', 4);
    shown = subject.get('shown_pages');
    assert.deepEqual(shown, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    subject.set('page', 5);
    shown = subject.get('shown_pages');
    assert.deepEqual(shown, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    subject.set('page', 6);
    shown = subject.get('shown_pages');
    assert.deepEqual(shown, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    subject.set('page', 7);
    shown = subject.get('shown_pages');
    assert.deepEqual(shown, [2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    subject.set('page', 8);
    shown = subject.get('shown_pages');
    assert.deepEqual(shown, [3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    subject.set('page', 9);
    shown = subject.get('shown_pages');
    assert.deepEqual(shown, [4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
    subject.set('page', 10);
    shown = subject.get('shown_pages');
    assert.deepEqual(shown, [5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
    subject.set('page', 11);
    shown = subject.get('shown_pages');
    assert.deepEqual(shown, [6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    subject.set('page', 12);
    shown = subject.get('shown_pages');
    assert.deepEqual(shown, [7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
    subject.set('page', 13);
    shown = subject.get('shown_pages');
    assert.deepEqual(shown, [8, 9, 10, 11, 12, 13, 14, 15, 16, 17]);
    subject.set('page', 14);
    shown = subject.get('shown_pages');
    assert.deepEqual(shown, [9, 10, 11, 12, 13, 14, 15, 16, 17, 18]);
    subject.set('page', 15);
    shown = subject.get('shown_pages');
    assert.deepEqual(shown, [9, 10, 11, 12, 13, 14, 15, 16, 17, 18]);
    subject.set('page', 16);
    shown = subject.get('shown_pages');
    assert.deepEqual(shown, [9, 10, 11, 12, 13, 14, 15, 16, 17, 18]);
    subject.set('page', 17);
    shown = subject.get('shown_pages');
    assert.deepEqual(shown, [9, 10, 11, 12, 13, 14, 15, 16, 17, 18]);
    subject.set('page', 18);
    shown = subject.get('shown_pages');
    assert.deepEqual(shown, [9, 10, 11, 12, 13, 14, 15, 16, 17, 18]);
    store.push('person', {id: 180});
    store.push('person', {id: 181});
    model.set('count', 181);
    shown = subject.get('shown_pages');
    assert.deepEqual(shown, [10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
});
