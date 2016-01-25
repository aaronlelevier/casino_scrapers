import Ember from 'ember';
import { test, module } from 'qunit';
import FilterBy from 'bsrs-ember/mixins/filter-by';

var FakeComponent = Ember.Object.extend(FilterBy, {
    toggleFilter: false,
    filterField: undefined,
    targetFilter: undefined,
    filterPlaceholder: undefined,
    run: function(column) {
        this.toggle(column);
    }
});

module('filter-by unit tests');

test('will update filter field/placeholder/target/toggle properties on calling ember object', function(assert) {
    let subject = new FakeComponent();
    let result = subject.run('fullname');
    assert.equal(subject.get('filterField'), 'fullname');
    assert.equal(subject.get('toggleFilter'), true);
    assert.equal(subject.get('targetFilter'), '.t-filter-fullname');
    assert.equal(subject.get('filterPlaceholder'), 'fullname');
});

test('will toggle filter off when no column name incoming', function(assert) {
    let subject = new FakeComponent();
    let result = subject.run('username');
    assert.equal(subject.get('toggleFilter'), true);
    result = subject.run(undefined);
    assert.equal(subject.get('toggleFilter'), false);
    assert.equal(subject.get('filterField'), undefined);
    assert.equal(subject.get('targetFilter'), '.t-filter-');
    assert.equal(subject.get('filterPlaceholder'), undefined);
});

test('will toggle filter off the current column name incoming', function(assert) {
    let subject = new FakeComponent();
    let result = subject.run('username');
    assert.equal(subject.get('toggleFilter'), true);
    result = subject.run('username');
    assert.equal(subject.get('toggleFilter'), false);
});

test('will toggle filter off but then back on when another column name incoming', function(assert) {
    let done = assert.async();
    let subject = new FakeComponent();
    let result = subject.run('username');
    assert.equal(subject.get('toggleFilter'), true);
    result = subject.run('title');
    assert.equal(subject.get('filterField'), 'title');
    assert.equal(subject.get('targetFilter'), '.t-filter-title');
    assert.equal(subject.get('filterPlaceholder'), 'title');
    setTimeout(function() {
        assert.equal(subject.get('toggleFilter'), true);
        done();
    }, 1);
});

test('will reset to page 1 with any toggle', function(assert) {
    let subject = new FakeComponent();
    let result = subject.run('username');
    assert.equal(subject.get('page'), 1);
    subject.set('page', 99);
    result = subject.run('username');
    assert.equal(subject.get('page'), 1);
});

test('related column name will set each field correctly', function(assert) {
    let subject = new FakeComponent();
    let result = subject.run('priority.translated_name');
    assert.equal(subject.get('filterField'), 'priority.translated_name');
    assert.equal(subject.get('targetFilter'), '.t-filter-priority-translated-name');
    assert.equal(subject.get('filterPlaceholder'), 'priority.translated_name');
});

test('array column name will set each field correctly', function(assert) {
    let subject = new FakeComponent();
    let result = subject.run('categories[name]');
    assert.equal(subject.get('filterField'), 'categories[name]');
    assert.equal(subject.get('targetFilter'), '.t-filter-categories[name]');
    assert.equal(subject.get('filterPlaceholder'), 'categories[name]');
});
