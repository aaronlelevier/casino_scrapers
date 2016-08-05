import Ember from 'ember';
import GridColumnText from '../../../helpers/grid-column-text';
import { module, test } from 'qunit';

module('Unit | Helper | grid-column-text');

test('simple model with property will return correct value', function(assert) {
  const model = Ember.Object.create({name: 'wat'});
  const result = GridColumnText.compute([model, 'name']);
  assert.equal(result, 'wat');
});

test('related property will return correct value', function(assert) {
  const related = Ember.Object.create({name: 'zap'});
  const model = Ember.Object.create({foo: related});
  const result = GridColumnText.compute([model, 'foo.name']);
  assert.equal(result, 'zap');
});

// test('related array property will return correct value', function(assert) {
//   const one = Ember.Object.create({name: 'ab'});
//   const two = Ember.Object.create({name: 'cd'});
//   const three = Ember.Object.create({name: 'ef'});
//   const model = Ember.Object.create({categories: Ember.A([one, two, three])});
//   assert.equal(GridColumnText.compute([model, 'categories[name]']), 'ab &#8226; cd &#8226; ef');
// });

test('helper is forgiving when model property not found', function(assert) {
  const model = Ember.Object.create({name: 'wat'});
  const result = GridColumnText.compute([model, 'yoyo']);
  assert.equal(result, '');
});

test('helper is forgiving when related property not found', function(assert) {
  const related = Ember.Object.create({name: 'zap'});
  const model = Ember.Object.create({foo: related});
  const result = GridColumnText.compute([model, 'foo.blah']);
  assert.equal(result, '');
});

test('helper is forgiving when related array property not found', function(assert) {
  const one = Ember.Object.create({name: 'ab'});
  const two = Ember.Object.create({name: 'cd'});
  const three = Ember.Object.create({name: 'ef'});
  const model = Ember.Object.create({categories: Ember.A([one, two, three])});
  assert.equal(GridColumnText.compute([model, 'categories[huh]']), '');
});

test('helper is forgiving when related array property incorrect', function(assert) {
  const one = Ember.Object.create({name: 'ab'});
  const two = Ember.Object.create({name: 'cd'});
  const three = Ember.Object.create({name: 'ef'});
  const model = Ember.Object.create({categories: Ember.A([one, two, three])});
  assert.equal(GridColumnText.compute([model, 'shoes[name]']), '');
});
