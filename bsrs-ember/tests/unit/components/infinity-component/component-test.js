import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('infinity-component', 'Unit | Component | infinity component', {
  needs: ['model:ticket', 'service:person-current'],
  unit: true
});

test('_loadMoreIfNeeded increments page if should load more records', function(assert) {
  const component = this.subject();
  component.set('page', 0);
  component._canLoadMore = () => true;
  component._shouldLoadMore = () => true;
  component.reachedInfinity = false;
  assert.equal(component.get('triggerOffset'), 100);
  assert.equal(component.get('page'), 0);
  component._loadMoreIfNeeded();
  assert.equal(component.get('page'), 1);
});

test('it sets reachedInfinity if !_canLoadMore', function(assert) {
  const component = this.subject();
  component.set('page', 0);
  component._canLoadMore = () => false;
  component._shouldLoadMore = () => true;
  component.reachedInfinity = false;
  assert.equal(component.get('reachedInfinity'), false);
  component._loadMoreIfNeeded();
  assert.equal(component.get('reachedInfinity'), true);
});

test('_canLoadMore returns boolean', function(assert) {
  const component = this.subject();
  component.set('page', 10);
  const model = Ember.Object.create({count: 10});
  component.set('model', model);
  const bool = component._canLoadMore();
  assert.equal(bool, false);
});

test('_canLoadMore returns true if no count (initialLoad)', function(assert) {
  const component = this.subject();
  component.set('page', 10);
  const model = Ember.Object.create({count: undefined});
  component.set('model', model);
  const bool = component._canLoadMore();
  assert.equal(bool, true);
});

test('infinityIsLoading prevents incrementing page', function(assert) {
  const component = this.subject();
  component.set('page', 10);
  component._canLoadMore = () => true;
  component._shouldLoadMore = () => true;
  component.infinityIsLoading = false;
  component._loadMoreIfNeeded();
  assert.equal(component.get('page'), 11);

  component._canLoadMore = () => true;
  component._shouldLoadMore = () => true;
  component.infinityIsLoading = false;
  component._loadMoreIfNeeded();
  assert.equal(component.get('page'), 12);

  component._canLoadMore = () => true;
  component._shouldLoadMore = () => true;
  component.infinityIsLoading = true;
  component._loadMoreIfNeeded();
  assert.equal(component.get('page'), 12);
});
