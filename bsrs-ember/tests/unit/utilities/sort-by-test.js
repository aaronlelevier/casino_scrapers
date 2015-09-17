import Ember from 'ember';
import { test, module } from 'qunit';
import SortBy from 'bsrs-ember/mixins/sort-by';

var FakeComponent = Ember.Object.extend(SortBy, {
    column: undefined,
    currentSort: undefined,
    run: function(currentSort, column) {
        return this.reorder(currentSort, column);
    }
});

module('sort-by unit tests');

test('will return correct array if pass in one field to sort by', function(assert) {
    let subject = new FakeComponent();
    let result = subject.run('', 'username');
    assert.deepEqual(result, ['username']);
});

test('will return correct array if pass in two fields to sort by', function(assert) {
    let subject = new FakeComponent();
    let result = subject.run('title', 'username');
    assert.deepEqual(result, ['username', 'title']);
});

test('will return correct array if pass in three fields to sort by', function(assert) {
    let subject = new FakeComponent();
    let result = subject.run('title,username', 'role');
    assert.deepEqual(result, ['role', 'title', 'username']);
    result = subject.run('role,title,username', 'title');
    assert.deepEqual(result, ['-title', 'role', 'username']);
    result = subject.run('-title,role,username', 'username');
    assert.deepEqual(result, ['-username', '-title', 'role']);
    result = subject.run('-username,-title,role', 'title');
    assert.deepEqual(result, ['title', '-username', 'role']);
});

test('will return correct array if pass in a field that is sorted descending', function(assert) {
    let subject = new FakeComponent();
    let result = subject.run('title', '-username');
    assert.deepEqual(result, ['-username', 'title']);
});

test('sort with existing currentSort will reverse direction of sort', function(assert) {
    let subject = new FakeComponent();
    let result = subject.run('title', 'title');
    assert.deepEqual(result, ['-title']);
});

test('sort with existing currentSort (with multiple) will reverse direction of sort', function(assert) {
    let subject = new FakeComponent();
    let result = subject.run('title,username', 'title');
    assert.deepEqual(result, ['-title', 'username']);
});
