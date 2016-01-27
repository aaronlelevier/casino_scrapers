import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';

var store, run = Ember.run, user; 

module('scott unit: many to many test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:user', 'model:shoe', 'model:issue', 'model:tag', 'model:user-shoe']);
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
    user.add_shoe(shoe_two);
    assert.ok(user.get('shoesIsDirty'));
    assert.equal(user.get('shoes').get('length'), 1);
    assert.equal(user.get('shoes').objectAt(0).get('id'), 5);
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
    user.rollbackShoe();
    assert.equal(user.get('shoes').get('length'), 1);
    assert.ok(user.get('shoesIsNotDirty'));
    user.remove_shoe(2);
    assert.equal(user.get('shoes').get('length'), 0);
    assert.ok(user.get('shoesIsDirty'));
    user.rollbackShoe();
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
    user_two.rollbackShoe();
    assert.equal(user.get('shoes').get('length'), 1);
    assert.ok(user.get('shoesIsNotDirty'));
    assert.ok(user_two.get('shoesIsNotDirty'));
    assert.equal(user_two.get('shoes').get('length'), 1);
    user.remove_shoe(2);
    assert.equal(user.get('shoes').get('length'), 0);
    assert.ok(user.get('shoesIsDirty'));
    assert.equal(user_two.get('shoes').get('length'), 1);
    assert.ok(user_two.get('shoesIsNotDirty'));
    user.rollbackShoe();
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
    user.rollbackShoe();
    assert.equal(user.get('shoes').get('length'), 1);
    assert.ok(user.get('shoesIsNotDirty'));
    user.remove_shoe(2);
    user.add_shoe(shoe_two);
    assert.equal(user.get('shoes').get('length'), 1);
    assert.ok(user.get('shoesIsDirty'));
    user.rollbackShoe();
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
    user.rollbackShoe();
    assert.equal(user.get('shoes').get('length'), 2);
    assert.ok(user.get('shoesIsNotDirty'));
    user.remove_shoe(5);
    user.remove_shoe(2);
    assert.equal(user.get('shoes').get('length'), 0);
    assert.ok(user.get('shoesIsDirty'));
    user.rollbackShoe();
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
    user.saveShoe();
    assert.equal(user.get('shoes').get('length'), 1);
    assert.ok(user.get('shoesIsNotDirty'));
    user.add_shoe(shoe_unused);
    assert.equal(user.get('shoes').get('length'), 2);
    assert.ok(user.get('shoesIsDirty'));
    user.saveShoe();
    assert.equal(user.get('shoes').get('length'), 2);
    assert.ok(user.get('shoesIsNotDirty'));
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

