import Ember from 'ember';
import {test, module} from '../helpers/qunit';
import module_registry from '../helpers/module_registry';
import plural from 'bsrs-components/utils/plural';

var store, run = Ember.run, user;

module('unit: many to many test', {
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:user', 'model:shoe', 'model:issue', 'model:tag', 'model:user-shoe', 'model:feet', 'model:finger', 'model:user-feet', 'model:user-finger', 'model:finger-join-food', 'model:food-type', 'model:finger-food']);
  }
});

test('m2m returns associated object or undefined and does not leak state', (assert) => {
  var user = store.push('user', {id: 1});
  store.push('shoe', {id: 2});
  // var shoes = user.get('shoes');
  // assert.notOk(shoes.objectAt(0));
  store.push('user-shoe', {id: 3, user_pk: 1, shoe_pk: 2});
  var m2m = user.get('user_shoes');
  assert.equal(m2m.get('length'), 1);
  var shoes = user.get('shoes');
  assert.equal(shoes.objectAt(0).get('id'), 2);
  run(() => {
    store.push('user-shoe', {id: 3, user_pk: 1, shoe_pk: 2, removed: true});
  });
  assert.equal(user.get('shoes').objectAt(0), undefined);
  assert.equal(user.get('user_shoes').objectAt(0), undefined);
  // var issue = store.push('issue', {id: 9});
  // store.push('tag', {id: 8, issues: [9]});
  // var tag = issue.get('tag');
  // assert.equal(tag.get('id'), 8);
  // assert.equal(user.get('shoes'), undefined);
  // run(() => {
  //     store.push('shoe', {id: 2, users: [1]});
  // });
  // assert.equal(user.get('shoes.id'), 2);
  // tag = issue.get('tag');
  // assert.equal(tag.get('id'), 8);
  // var user_2 = store.push('user', {id: 2});
  // store.push('shoe', {id: 3, users: [2]});
  // var shoe_2 = user_2.get('shoes');
  // assert.equal(shoe_2.get('id'), 3);
});

test('shoe property should return all associated shoe or empty array', (assert) => {
  let m2m = store.push('user-shoe', {id: 3, user_pk: 1, shoe_pk: 2});
  user = store.push('user', {id: 1, user_shoes_fks: [3]});
  store.push('shoe', {id: 2});
  const shoe = user.get('shoes');
  assert.equal(shoe.get('length'), 1);
  assert.equal(shoe.objectAt(0).get('id'), 2);
  run(function() {
    store.push('user-shoe', {id: m2m.get('id'), removed: true});
  });
  assert.equal(user.get('shoes').get('length'), 0);
});

test('shoe property is not dirty when no shoe present (undefined)', (assert) => {
  user = store.push('user', {id: 1, user_shoes_fks: undefined});
  store.push('shoe', {id: 2});
  assert.equal(user.get('shoes').get('length'), 0);
  assert.ok(user.get('shoesIsNotDirty'));
});

test('shoe property is not dirty when no shoe present (empty array)', (assert) => {
  user = store.push('user', {id: 1, user_shoes_fks: []});
  store.push('shoe', {id: 2});
  assert.equal(user.get('shoes').get('length'), 0);
  assert.ok(user.get('shoesIsNotDirty'));
});

test('shoe property is not dirty when attr on shoe is changed', (assert) => {
  store.push('user-shoe', {id: 3, user_pk: 1, shoe_pk: 2});
  let shoe = store.push('shoe', {id: 2});
  user = store.push('user', {id: 1, user_shoes_fks: [3]});
  assert.equal(user.get('shoes').get('length'), 1);
  assert.ok(user.get('shoesIsNotDirty'));
  run(function() {
    store.push('shoe', {id: 2, name: 'wat'});
  });
  assert.ok(user.get('shoesIsNotDirty'));
  assert.equal(user.get('shoes').get('length'), 1);
});

test('removing a user-shoe will mark the user as dirty and reduce the associated shoe models to zero', (assert) => {
  store.push('user-shoe', {id: 3, user_pk: 1, shoe_pk: 2});
  let shoe = store.push('shoe', {id: 2});
  user = store.push('user', {id: 1, user_shoes_fks: [3]});
  assert.equal(user.get('shoes').get('length'), 1);
  assert.ok(user.get('shoesIsNotDirty'));
  user.remove_shoe(2);
  assert.ok(user.get('shoesIsDirty'));
  assert.equal(user.get('shoes').get('length'), 0);
});

test('replacing a user-shoe with some other user-shoe still shows the user model as dirty', (assert) => {
  store.push('user-shoe', {id: 3, user_pk: 1, shoe_pk: 2});
  store.push('shoe', {id: 2});
  const shoe_two = {id: 5};
  user = store.push('user', {id: 1, user_shoes_fks: [3]});
  assert.equal(user.get('shoes').get('length'), 1);
  assert.ok(user.get('shoesIsNotDirty'));
  user.remove_shoe(2);
  assert.ok(user.get('shoesIsDirty'));
  assert.equal(user.get('shoes').get('length'), 0);
  let added_shoe = user.add_shoe(shoe_two);
  // assert.ok(added_shoe.get('id'));
  // assert.ok(user.get('shoesIsDirty'));
  // assert.equal(user.get('shoes').get('length'), 1);
  // assert.equal(user.get('shoes').objectAt(0).get('id'), 5);
});

test('shoe property only returns the single matching item even when multiple people (shoe) exist', (assert) => {
  store.push('user-shoe', {id: 3, user_pk: 1, shoe_pk: 5});
  const shoe_two = {id: 5};
  user = store.push('user', {id: 1, user_shoes_fks: [3]});
  user.add_shoe(shoe_two);
  let shoe = user.get('shoes');
  assert.equal(shoe.get('length'), 1);
  assert.equal(shoe.objectAt(0).get('id'), 5);
});

test('shoe property returns multiple matching items when multiple people (shoe) exist', (assert) => {
  store.push('shoe', {id: 2});
  store.push('shoe', {id: 5});
  store.push('user-shoe', {id: 3, shoe_pk: 5, user_pk: 1});
  store.push('user-shoe', {id: 4, shoe_pk: 2, user_pk: 1});
  user = store.push('user', {id: 1, user_shoes_fks: [3, 4]});
  let shoe = user.get('shoes');
  assert.equal(shoe.get('length'), 2);
  assert.equal(shoe.objectAt(0).get('id'), 2);
  assert.equal(shoe.objectAt(1).get('id'), 5);
});

test('shoe property will update when the m2m array suddenly has the shoe pk (starting w/ empty array)', (assert) => {
  user = store.push('user', {id: 1, user_shoes_fks: []});
  let shoe = {id: 2};
  assert.equal(user.get('shoes').get('length'), 0);
  assert.ok(user.get('shoesIsNotDirty'));
  user.add_shoe(shoe);
  assert.equal(user.get('shoes').get('length'), 1);
  assert.equal(user.get('shoes').objectAt(0).get('id'), 2);
  assert.ok(user.get('shoesIsDirty'));
});

test('shoe property will update when the m2m array suddenly has the shoe pk', (assert) => {
  store.push('user-shoe', {id: 3, shoe_pk: 2, user_pk: 1});
  user = store.push('user', {id: 1, user_shoes_fks: [3]});
  let shoe = store.push('shoe', {id: 2});
  let shoe_two = {id: 5};
  assert.equal(user.get('shoes').get('length'), 1);
  assert.ok(user.get('shoesIsNotDirty'));
  user.add_shoe(shoe_two);
  assert.equal(user.get('shoes').get('length'), 2);
  assert.equal(user.get('shoes').objectAt(0).get('id'), 2);
  assert.equal(user.get('shoes').objectAt(1).get('id'), 5);
  assert.ok(user.get('shoesIsDirty'));
});

test('shoe property will update when the m2m array suddenly removes the shoe', (assert) => {
  let m2m = store.push('user-shoe', {id: 3, shoe_pk: 2, user_pk: 1});
  user = store.push('user', {id: 1, user_shoes_fks: [3]});
  let shoe = store.push('shoe', {id: 2});
  assert.equal(user.get('shoes').get('length'), 1);
  user.remove_shoe(2);
  assert.equal(user.get('shoes').get('length'), 0);
});

test('when shoe is changed dirty tracking works as expected (removing)', (assert) => {
  store.push('user-shoe', {id: 3, user_pk: 1, shoe_pk: 2});
  let shoe = store.push('shoe', {id: 2});
  user = store.push('user', {id: 1, user_shoes_fks: [3]});
  assert.equal(user.get('shoes').get('length'), 1);
  assert.ok(user.get('shoesIsNotDirty'));
  user.remove_shoe(2);
  assert.equal(user.get('shoes').get('length'), 0);
  assert.ok(user.get('shoesIsDirty'));
  user.rollbackShoes();
  assert.equal(user.get('shoes').get('length'), 1);
  assert.ok(user.get('shoesIsNotDirty'));
  user.remove_shoe(2);
  assert.equal(user.get('shoes').get('length'), 0);
  assert.ok(user.get('shoesIsDirty'));
  user.rollbackShoes();
  assert.equal(user.get('shoes').get('length'), 1);
  assert.ok(user.get('shoesIsNotDirty'));
});

test('add_shoe will add back old join model after it was removed and dirty the model (multiple)', (assert) => {
  const user = store.push('user', {id: 1, user_shoes_fks: [3, 4]});
  const shoe_two = store.push('shoe', {id: 5});
  const shoe_three = store.push('shoe', {id: 7});
  store.push('user-shoe', {id: 3, user_pk: 1, shoe_pk: 5});
  store.push('user-shoe', {id: 4, user_pk: 1, shoe_pk: 7});
  user.remove_shoe(shoe_three.get('id'));
  assert.equal(user.get('shoes').get('length'), 1);
  user.add_shoe(shoe_three);
  assert.equal(user.get('shoes').get('length'), 2);
  assert.ok(user.get('shoesIsNotDirty'));
});

test('multiple user\'s with same shoe will rollback correctly', (assert) => {
  store.push('user-shoe', {id: 3, user_pk: 1, shoe_pk: 2});
  store.push('user-shoe', {id: 4, user_pk: 10, shoe_pk: 2});
  let shoe = store.push('shoe', {id: 2});
  user = store.push('user', {id: 1, user_shoes_fks: [3]});
  let user_two = store.push('user', {id: 10, user_shoes_fks: [4]});
  assert.equal(user.get('shoes').get('length'), 1);
  assert.ok(user.get('shoesIsNotDirty'));
  assert.ok(user_two.get('shoesIsNotDirty'));
  user_two.remove_shoe(2);
  assert.equal(user.get('shoes').get('length'), 1);
  assert.equal(user_two.get('shoes').get('length'), 0);
  assert.ok(user.get('shoesIsNotDirty'));
  assert.ok(user_two.get('shoesIsDirty'));
  user_two.rollbackShoes();
  assert.equal(user.get('shoes').get('length'), 1);
  assert.ok(user.get('shoesIsNotDirty'));
  assert.ok(user_two.get('shoesIsNotDirty'));
  assert.equal(user_two.get('shoes').get('length'), 1);
  user.remove_shoe(2);
  assert.equal(user.get('shoes').get('length'), 0);
  assert.ok(user.get('shoesIsDirty'));
  assert.equal(user_two.get('shoes').get('length'), 1);
  assert.ok(user_two.get('shoesIsNotDirty'));
  user.rollbackShoes();
  assert.equal(user.get('shoes').get('length'), 1);
  assert.ok(user.get('shoesIsNotDirty'));
  assert.equal(user_two.get('shoes').get('length'), 1);
  assert.ok(user_two.get('shoesIsNotDirty'));
});

test('when shoe is changed dirty tracking works as expected (replacing)', (assert) => {
  store.push('user-shoe', {id: 3, user_pk: 1, shoe_pk: 2});
  store.push('shoe', {id: 2});
  const shoe_two = {id: 5};
  user = store.push('user', {id: 1, user_shoes_fks: [3]});
  assert.equal(user.get('shoes').get('length'), 1);
  assert.ok(user.get('shoesIsNotDirty'));
  user.remove_shoe(2);
  assert.ok(user.get('shoesIsDirty'));
  assert.equal(user.get('shoes').get('length'), 0);
  user.add_shoe(shoe_two);
  assert.ok(user.get('shoesIsDirty'));
  assert.equal(user.get('shoes').get('length'), 1);
  assert.equal(user.get('shoes').objectAt(0).get('id'), 5);
  user.rollbackShoes();
  assert.equal(user.get('shoes').get('length'), 1);
  assert.ok(user.get('shoesIsNotDirty'));
  user.remove_shoe(2);
  user.add_shoe(shoe_two);
  assert.equal(user.get('shoes').get('length'), 1);
  assert.ok(user.get('shoesIsDirty'));
  user.rollbackShoes();
  assert.equal(user.get('shoes').get('length'), 1);
  assert.ok(user.get('shoesIsNotDirty'));
});

test('when shoe is suddently removed it shows as a dirty relationship (when it has multiple locations to begin with)', (assert) => {
  store.push('shoe', {id: 2});
  store.push('shoe', {id: 5});
  store.push('user-shoe', {id: 3, shoe_pk: 2, user_pk: 1});
  store.push('user-shoe', {id: 4, shoe_pk: 5, user_pk: 1});
  user = store.push('user', {id: 1, user_shoes_fks: [3, 4]});
  assert.equal(user.get('shoes').get('length'), 2);
  assert.ok(user.get('shoesIsNotDirty'));
  user.remove_shoe(5);
  assert.equal(user.get('shoes').get('length'), 1);
  assert.ok(user.get('shoesIsDirty'));
});

test('rollback user will reset the previously used people (shoe) when switching from valid shoe array to nothing', (assert) => {
  store.push('shoe', {id: 2});
  store.push('shoe', {id: 5});
  store.push('user-shoe', {id: 3, shoe_pk: 2, user_pk: 1});
  store.push('user-shoe', {id: 4, shoe_pk: 5, user_pk: 1});
  user = store.push('user', {id: 1, user_shoes_fks: [3, 4]});
  assert.equal(user.get('shoes').get('length'), 2);
  assert.ok(user.get('shoesIsNotDirty'));
  user.remove_shoe(5);
  assert.equal(user.get('shoes').get('length'), 1);
  assert.ok(user.get('shoesIsDirty'));
  user.rollbackShoes();
  assert.equal(user.get('shoes').get('length'), 2);
  assert.ok(user.get('shoesIsNotDirty'));
  user.remove_shoe(5);
  user.remove_shoe(2);
  assert.equal(user.get('shoes').get('length'), 0);
  assert.ok(user.get('shoesIsDirty'));
  user.rollbackShoes();
  assert.equal(user.get('shoes').get('length'), 2);
  assert.ok(user.get('shoesIsNotDirty'));
  assert.equal(user.get('shoes').objectAt(0).get('id'), 2);
  assert.equal(user.get('shoes').objectAt(1).get('id'), 5);
});

test('rollback shoe will reset the previous people (shoe) when switching from one shoe to another and saving in between each step', (assert) => {
  store.push('shoe', {id: 2});
  store.push('shoe', {id: 5});
  const shoe_unused = {id: 6};
  store.push('user-shoe', {id: 3, shoe_pk: 2, user_pk: 1});
  store.push('user-shoe', {id: 4, shoe_pk: 5, user_pk: 1});
  user = store.push('user', {id: 1, user_shoes_fks: [3, 4]});
  assert.equal(user.get('shoes').get('length'), 2);
  user.remove_shoe(2);
  assert.equal(user.get('shoes').get('length'), 1);
  assert.ok(user.get('shoesIsDirty'));
  user.saveShoes();
  assert.equal(user.get('shoes').get('length'), 1);
  assert.ok(user.get('shoesIsNotDirty'));
  user.add_shoe(shoe_unused);
  assert.equal(user.get('shoes').get('length'), 2);
  assert.ok(user.get('shoesIsDirty'));
  user.saveShoes();
  assert.equal(user.get('shoes').get('length'), 2);
  assert.ok(user.get('shoesIsNotDirty'));
  user.remove_shoe(shoe_unused.id);
  assert.equal(user.get('shoes').get('length'), 1);
  user.rollbackShoes();
  assert.equal(user.get('shoes').get('length'), 2);
});

test('save shoes with multiple m2m models will update properly if remove current and add different shoe', (assert) => {
  store.push('shoe', {id: 2});
  store.push('shoe', {id: 5});
  const shoe_unused = {id: 6};
  store.push('user-shoe', {id: 3, shoe_pk: 2, user_pk: 1});
  store.push('user-shoe', {id: 4, shoe_pk: 5, user_pk: 1});
  user = store.push('user', {id: 1, user_shoes_fks: [3, 4]});
  assert.equal(user.get('shoes').get('length'), 2);
  user.remove_shoe(2);
  user.add_shoe(shoe_unused);
  assert.equal(user.get('shoes').get('length'), 2);
  assert.deepEqual(user.get('user_shoes_fks'), [3,4]);
  assert.ok(user.get('shoesIsDirty'));
  user.saveShoes();
  assert.equal(user.get('shoes').get('length'), 2);
  assert.notEqual(user.get('user_shoes_fks'), [3,4]);
  assert.ok(user.get('shoesIsNotDirty'));
});

test('many_to_many_dirty_ - adding shoe wont dirty the model (no existing shoe)', assert => {
  let user = store.push('user', {id: 1});
  assert.equal(user.get('user_feet_ids').length, 0);
  assert.equal(user.get('user_feet_fks').length, 0);
  assert.ok(user.get('feetIsNotDirty'));
  user.add_feet({id: 4});
  assert.equal(user.get('user_feet_ids').length, 1);
  assert.equal(user.get('user_feet_fks').length, 0);
  assert.ok(user.get('feetIsNotDirty'));
});

test('many_to_many_dirty_ - adding feet wont dirty the model (existing feet)', assert => {
  let user = store.push('user', {id: 1, user_feet_fks: [3]});
  store.push('feet', {id: 2});
  store.push('user-feet', {id: 3, user_pk: 1, feet_pk: 2});
  assert.equal(user.get('user_feet_ids').length, 1);
  assert.equal(user.get('user_feet_fks').length, 1);
  assert.ok(user.get('feetIsNotDirty'));
  user.add_feet({id: 4});
  assert.equal(user.get('user_feet_ids').length, 2);
  assert.equal(user.get('user_feet_fks').length, 1);
  assert.ok(user.get('feetIsNotDirty'));
});

test('many_to_many_dirty_unlessAddedM2M - removing feet will dirty model', assert => {
  let user = store.push('user', {id: 1, user_feet_fks: [3]});
  store.push('feet', {id: 2});
  store.push('user-feet', {id: 3, user_pk: 1, feet_pk: 2});
  assert.equal(user.get('user_feet_ids').length, 1);
  assert.equal(user.get('user_feet_fks').length, 1);
  assert.ok(user.get('feetIsNotDirty'));
  user.remove_feet(2);
  assert.equal(user.get('user_feet_ids').length, 0);
  assert.equal(user.get('user_feet_fks').length, 1);
  assert.ok(user.get('feetIsDirty'));
});

test('many_to_many_dirty_unlessAddedM2M - add remove same feet will not dirty model', assert => {
  let user = store.push('user', {id: 1, user_feet_fks: [3]});
  store.push('feet', {id: 2});
  store.push('user-feet', {id: 3, user_pk: 1, feet_pk: 2});
  assert.equal(user.get('user_feet_ids').length, 1);
  assert.equal(user.get('user_feet_fks').length, 1);
  assert.ok(user.get('feetIsNotDirty'));
  user.add_feet({id: 4});
  user.remove_feet(4);
  assert.equal(user.get('user_feet_ids').length, 1);
  assert.equal(user.get('user_feet_fks').length, 1);
  assert.ok(user.get('feetIsNotDirty'));
});

test('many_to_many_dirty_unlessAddedM2M - removing feet and adding new feet will dirty model', assert => {
  let user = store.push('user', {id: 1, user_feet_fks: [3]});
  store.push('feet', {id: 2});
  store.push('user-feet', {id: 3, user_pk: 1, feet_pk: 2});
  assert.equal(user.get('user_feet_ids').length, 1);
  assert.equal(user.get('user_feet_fks').length, 1);
  assert.ok(user.get('feetIsNotDirty'));
  user.remove_feet(2);
  assert.ok(user.get('feetIsDirty'));
  user.add_feet({id: 4});
  assert.equal(user.get('user_feet_ids').length, 1);
  assert.equal(user.get('user_feet_fks').length, 1);
  assert.ok(user.get('feetIsDirty'));
});

//TODO: test main_model config. Need to generate a mixin that is shared across model instances
// test('save feet with main_model config', assert => {
//   let user = store.push('user', {id: 1, user_feet_fks: [3]});
//   store.push('feet', {id: 2});
//   store.push('user-feet', {id: 3, user_pk: 1, feet_pk: 2});
//   assert.equal(user.get('user_feet_ids').length, 1);
//   assert.equal(user.get('user_feet_fks').length, 1);
//   assert.ok(user.get('feetIsNotDirty'));
//   user.remove_feet(2);
//   assert.ok(user.get('feetIsDirty'));
//   user.saveFeet();
// });

test('on push, model will be saved if not dirty and gets updated properties', (assert) => {
  store.push('shoe', {id: 2});
  store.push('shoe', {id: 5});
  const pushed_unused = store.push('shoe', {id: 6, name: 'wat'});
  const shoe_unused = {id: 6, name: 'who'};
  store.push('user-shoe', {id: 3, shoe_pk: 2, user_pk: 1});
  store.push('user-shoe', {id: 4, shoe_pk: 5, user_pk: 1});
  user = store.push('user', {id: 1, user_shoes_fks: [3, 4]});
  assert.equal(user.get('shoes').get('length'), 2);
  user.add_shoe(shoe_unused);
  assert.equal(user.get('shoes').get('length'), 3);
  assert.ok(pushed_unused.get('isNotDirty'));
  user.saveShoes();
  assert.ok(pushed_unused.get('isNotDirty'));
  assert.equal(user.get('shoes').get('length'), 3);
  assert.ok(user.get('shoesIsNotDirty'));
});

test('add many to many works with models defined with Ember.Object as well', (assert) => {
  store.push('finger', {id: 2});
  store.push('finger', {id: 5});
  const pushed_unused = store.push('finger', {id: 6, name: 'wat'});
  const finger_unused = {id: 6, name: 'who'};
  store.push('user-finger', {id: 3, finger_pk: 2, user_pk: 1});
  store.push('user-finger', {id: 4, finger_pk: 5, user_pk: 1});
  user = store.push('user', {id: 1, user_fingers_fks: [3, 4]});
  assert.equal(user.get('fingers').get('length'), 2);
  user.add_finger(finger_unused);
  assert.equal(user.get('fingers').get('length'), 3);
});

test('on push, model will be not be saved if dirty and gets updated properties', (assert) => {
  store.push('shoe', {id: 2});
  store.push('shoe', {id: 5});
  let pushed_unused = store.push('shoe', {id: 6, name: 'wat'});
  pushed_unused.set('name', 'foo');
  assert.ok(pushed_unused.get('isDirty'));
  const shoe_unused = {id: 6, name: 'who'};
  store.push('user-shoe', {id: 3, shoe_pk: 2, user_pk: 1});
  store.push('user-shoe', {id: 4, shoe_pk: 5, user_pk: 1});
  user = store.push('user', {id: 1, user_shoes_fks: [3, 4]});
  assert.equal(user.get('shoes').get('length'), 2);
  user.add_shoe(shoe_unused);
  assert.equal(user.get('shoes').get('length'), 3);
  pushed_unused = store.find('shoe', 6);
  assert.ok(pushed_unused.get('isDirty'));
  assert.ok(user.get('shoesIsDirty'));
  user.saveShoes();
  assert.ok(pushed_unused.get('isDirty'));
  assert.equal(user.get('shoes').get('length'), 3);
  assert.ok(user.get('shoesIsNotDirty'));
});

test('existing join models will not be squashed over', (assert) => {
  store.push('shoe', {id: 2});
  store.push('shoe', {id: 5});
  const shoe_unused = {id: 6};
  const unused_join_model = store.push('user-shoe', {id: 3, shoe_pk: 6, user_pk: 2, removed: true});
  store.push('user-shoe', {id: 4, shoe_pk: 5, user_pk: 1});
  user = store.push('user', {id: 1, user_shoes_fks: [4]});
  assert.equal(user.get('shoes').get('length'), 1);
  user.add_shoe(shoe_unused);
  assert.equal(store.find('user-shoe').get('length'), 3);
  assert.equal(unused_join_model.get('removed'), true);
});

test('shoe_ids computed returns a flat list of ids for each shoe', (assert) => {
  store.push('shoe', {id: 2});
  store.push('shoe', {id: 5});
  store.push('user-shoe', {id: 3, shoe_pk: 2, user_pk: 1});
  store.push('user-shoe', {id: 4, shoe_pk: 5, user_pk: 1});
  user = store.push('user', {id: 1, user_shoes_fks: [3, 4]});
  assert.equal(user.get('shoes').get('length'), 2);
  assert.deepEqual(user.get('shoes_ids'), [2, 5]);
  user.remove_shoe(2);
  assert.equal(user.get('shoes').get('length'), 1);
  assert.deepEqual(user.get('shoes_ids'), [5]);
});

test('user_shoe_ids computed returns a flat list of ids for each shoe', (assert) => {
  store.push('shoe', {id: 2});
  store.push('shoe', {id: 5});
  store.push('user-shoe', {id: 3, shoe_pk: 2, user_pk: 1});
  store.push('user-shoe', {id: 4, shoe_pk: 5, user_pk: 1});
  user = store.push('user', {id: 1, user_shoes_fks: [3, 4]});
  assert.equal(user.get('shoes').get('length'), 2);
  assert.deepEqual(user.get('user_shoes_ids'), [3, 4]);
  user.remove_shoe(2);
  assert.equal(user.get('shoes').get('length'), 1);
  assert.deepEqual(user.get('user_shoes_ids'), [4]);
});

test('finger-join-food is setup correctly with remove (extra dashes in name)', (assert) => {
  store.push('finger-join-food', {id: 2, finger_food_pk: 3, food_type_pk: 4});
  store.push('finger-food', {id: 3});
  const parent = store.push('food-type', {id: 4, food_type_finger_food_fks: [2]});
  assert.equal(parent.get('finger_food').get('length'), 1);
  assert.equal(parent.get('isNotDirtyOrRelatedNotDirty'), true);
  parent.remove_finger_food(3);
  assert.equal(parent.get('isNotDirtyOrRelatedNotDirty'), false);
  assert.equal(parent.get('finger_food').get('length'), 0);
});

test('finger-join-food is setup correctly with add', (assert) => {
  store.push('finger-join-food', {id: 2, finger_food_pk: 3, food_type_pk: 4});
  store.push('finger-food', {id: 3});
  store.push('finger-food', {id: 5});
  const parent = store.push('food-type', {id: 4, food_type_finger_food_fks: [2]});
  assert.equal(parent.get('finger_food').get('length'), 1);
  assert.equal(parent.get('isNotDirtyOrRelatedNotDirty'), true);
  parent.add_finger_food({id: 5});
  assert.equal(parent.get('finger_food').get('length'), 2);
  assert.equal(parent.get('isNotDirtyOrRelatedNotDirty'), false);
});

test('plural utility', assert => {
  let str = plural('shoe');
  assert.equal(str, 'shoes');
  str = plural('happy');
  assert.equal(str, 'happies');
});
