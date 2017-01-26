import Ember from 'ember';
import { test, module, skip } from 'qunit';
import FilterBy from 'bsrs-ember/mixins/filter-by';

var FakeComponent = Ember.Object.extend(FilterBy, {
  toggleFilter: false,
  filterField: undefined,
  filterPlaceholder: undefined,
  run: function(column) {
    this.toggle(column);
  }
});

module('filter-by unit tests');

test('will update filter field/placeholder/target/toggle properties on calling ember object', function(assert) {
  let subject = new FakeComponent();
  const column = {field: 'fullname', headerLabel: 'wat'};
  subject.run(column);
  assert.equal(subject.get('filterField'), 'fullname');
  assert.equal(subject.get('toggleFilter'), true);
  assert.equal(subject.get('filterPlaceholder'), 'wat');
});

test('will toggle filter off when no column name incoming', function(assert) {
  let subject = new FakeComponent();
  const column = {field: 'username'};
  subject.run(column);
  assert.equal(subject.get('toggleFilter'), true);
  subject.run(undefined);
  assert.equal(subject.get('toggleFilter'), false);
  assert.equal(subject.get('filterField'), undefined);
  assert.equal(subject.get('filterPlaceholder'), undefined);
});

test('will toggle filter off the current column name incoming', function(assert) {
  let subject = new FakeComponent();
  const column = {field: 'username'};
  subject.run(column);
  assert.equal(subject.get('toggleFilter'), true);
  subject.run(column);
  assert.equal(subject.get('toggleFilter'), false);
});

skip('will toggle filter off but then back on when another column name incoming', function(assert) {
  let done = assert.async();
  let subject = new FakeComponent();
  let column = {field: 'username', headerLabel: 'wat'};
  subject.run(column);
  assert.equal(subject.get('toggleFilter'), true);
  column = {field: 'title', headerLabel: 'title wat'};
  subject.run(column);
  assert.equal(subject.get('filterField'), 'title');
  assert.equal(subject.get('filterPlaceholder'), 'title wat');
  setTimeout(function() {
    assert.equal(subject.get('toggleFilter'), true);
    done();
  }, 1);
});

test('will reset to page 1 with any toggle', function(assert) {
  let subject = new FakeComponent();
  let column = {field: 'username'};
  subject.run(column);
  assert.equal(subject.get('page'), 1);
  subject.set('page', 99);
  subject.run(column);
  assert.equal(subject.get('page'), 1);
});

test('related column name will set each field correctly', function(assert) {
  let subject = new FakeComponent();
  let column = {field: 'priority.name', headerLabel: 'which priority'};
  subject.run(column);
  assert.equal(subject.get('filterField'), 'priority.name');
  assert.equal(subject.get('filterPlaceholder'), 'which priority');
});

// test('array column name will set each field correctly', function(assert) {
//     let subject = new FakeComponent();
//     let result = subject.run('categories[name]');
//     assert.equal(subject.get('filterField'), 'categories[name]');
//     assert.equal(subject.get('filterPlaceholder'), 'categories[name]');
// });
