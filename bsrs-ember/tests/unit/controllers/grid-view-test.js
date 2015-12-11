import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import GridViewController from 'bsrs-ember/mixins/controller/grid';

module('unit: grid-view-controller test');

test('hasActiveFilterSet returns true when any page, sort, search, find or page_number present', (assert) => {
    var subject = GridViewController.create();
    assert.ok(!subject.get('hasActiveFilterSet'));
    subject.set('page', 2);
    assert.equal(subject.get('hasActiveFilterSet'), true);
    assert.ok(subject.get('hasActiveFilterSet'));
    subject.set('page', 1);
    assert.ok(!subject.get('hasActiveFilterSet'));
    subject.set('search', 'd');
    assert.ok(subject.get('hasActiveFilterSet'));
    subject.set('search', null);
    assert.ok(!subject.get('hasActiveFilterSet'));
    subject.set('search', '');
    assert.ok(!subject.get('hasActiveFilterSet'));
    subject.set('sort', 'name');
    assert.ok(subject.get('hasActiveFilterSet'));
    subject.set('sort', null);
    assert.ok(!subject.get('hasActiveFilterSet'));
    subject.set('sort', '');
    assert.ok(!subject.get('hasActiveFilterSet'));
    subject.set('find', 'name:x');
    assert.ok(subject.get('hasActiveFilterSet'));
    subject.set('find', null);
    assert.ok(!subject.get('hasActiveFilterSet'));
    subject.set('find', '');
    assert.ok(!subject.get('hasActiveFilterSet'));
    subject.set('page_size', '25');
    assert.ok(subject.get('hasActiveFilterSet'));
    subject.set('page_size', null);
    assert.ok(!subject.get('hasActiveFilterSet'));
    subject.set('page_size', '');
    assert.ok(!subject.get('hasActiveFilterSet'));
});
