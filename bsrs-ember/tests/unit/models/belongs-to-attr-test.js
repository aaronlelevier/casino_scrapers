import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';

var store, run = Ember.run, user; 

module('unit: belongs test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:user', 'model:hat', 'model:issue', 'model:tag']);
    }
});

test('belongs to returns associated object or undefined and does not leak state', (assert) => {
    var user = store.push('user', {id: 1});
    store.push('hat', {id: 2, users: [1]});
    var hat = user.get('hat');
    assert.equal(hat.get('id'), 2);
    Ember.run(() => {
        store.push('hat', {id: 2, users: []});
    });
    assert.equal(user.get('hat'), undefined);
    var issue = store.push('issue', {id: 9});
    store.push('tag', {id: 8, issues: [9]});
    var tag = issue.get('tag');
    assert.equal(tag.get('id'), 8);
    assert.equal(user.get('hat'), undefined);
    Ember.run(() => {
        store.push('hat', {id: 2, users: [1]});
    });
    assert.equal(user.get('hat.id'), 2);
    tag = issue.get('tag');
    assert.equal(tag.get('id'), 8);
    var user_2 = store.push('user', {id: 2});
    store.push('hat', {id: 3, users: [2]});
    var hat_2 = user_2.get('hat');
    assert.equal(hat_2.get('id'), 3);
});

test('belongs_to computed is read only', (assert) => {
    assert.expect(3);
    store.push('hat', {id: 2, users: [1]});
    var user = store.push('user', {id: 1});
    assert.ok(user.get('hat'));
    try{
        user.set('hats', []);
    }catch(e) {
        assert.ok(e.message.indexOf('Cannot set read-only') > -1);
    }
    assert.ok(user.get('hat'));
});

test('hat property returns associated object or undefined', (assert) => {
    user = store.push('user', {id: 1});
    store.push('hat', {id: 2, users: [1]});
    let hat = user.get('hat');
    assert.equal(hat.get('id'), 2);
    run(() => {
        store.push('hat', {id: hat.get('id'), users: []});
    });
    hat = user.get('hat');
    assert.equal(hat, undefined);
});

test('users array can be undefined', function(assert) {
    let user = store.push('user', {id: 1});
    let hat = store.push('hat', {id: 2, users: undefined});
    assert.equal(user.get('hat'), undefined);
    user.change_hat(2);
    assert.deepEqual(hat.get('users'), [1]);
    assert.equal(user.get('hat.id'), 2);
    let hats = store.find('hat');
    assert.equal(hats.get('length'), 1);
});

test('change_hat will append user id to the (new) hat users array', function(assert) {
    let user = store.push('user', {id: 1});
    let hat = store.push('hat', {id: 2, users: [9, 8, 7]});
    assert.equal(user.get('hat'), undefined);
    user.change_hat(2);
    assert.deepEqual(hat.get('users'), [9, 8, 7, 1]);
    assert.equal(user.get('hat.id'), 2);
    let hats = store.find('hat');
    assert.equal(hats.get('length'), 1);
    let issue = store.push('issue', {id: 4});
    let tag = store.push('tag', {id: 5, issues: [19, 18, 17]});
    assert.equal(issue.get('tag'), undefined);
    issue.change_tag(5);
    assert.deepEqual(tag.get('issues'), [19, 18, 17, 4]);
    assert.equal(issue.get('tag.id'), 5);
    let tags = store.find('tag');
    assert.equal(tags.get('length'), 1);
});

test('change_hat will remove the user id from the current hats users array', function(assert) {
    let user = store.push('user', {id: 1});
    let hat = store.push('hat', {id: 2, users: [9, 1, 7]});
    store.push('hat', {id: 3, users: []});
    assert.equal(user.get('hat.id'), 2);
    user.change_hat(3);
    assert.deepEqual(hat.get('users'), [9, 7]);
    assert.equal(user.get('hat.id'), 3);
    let issue = store.push('issue', {id: 11});
    let tag = store.push('tag', {id: 12, issues: [19, 11, 17]});
    store.push('tag', {id: 13, issues: []});
    assert.equal(issue.get('tag.id'), 12);
    issue.change_tag(13);
    assert.deepEqual(tag.get('issues'), [19, 17]);
    assert.equal(issue.get('tag.id'), 13);
});

test('user is dirty or related is dirty when existing hat is altered', (assert) => {
    user = store.push('user', {id: 1, hat_fk: 2});
    store.push('hat', {id: 2, users: [1]});
    store.push('hat', {id: 3, users: []});
    assert.equal(user.get('hat.id'), 2);
    assert.ok(user.get('hatIsNotDirty'));
    user.change_hat(3);
    assert.equal(user.get('hat.id'), 3);
    assert.ok(user.get('hatIsDirty'));
});

test('user is dirty or related is dirty when existing hat is altered (starting w/ nothing)', (assert) => {
    user = store.push('user', {id: 1, hat_fk: undefined});
    store.push('hat', {id: 3, users: []});
    assert.equal(user.get('hat'), undefined);
    assert.ok(user.get('hatIsNotDirty'));
    user.change_hat(3);
    assert.equal(user.get('hat.id'), 3);
    assert.ok(user.get('hatIsDirty'));
});

test('rollback hat will revert and reboot the dirty hat to clean', (assert) => {
    user = store.push('user', {id: 1, hat_fk: 2});
    store.push('hat', {id: 2, users: [1]});
    store.push('hat', {id: 3, users: []});
    assert.equal(user.get('hat.id'), 2);
    assert.ok(user.get('hatIsNotDirty'));
    user.change_hat(3);
    assert.equal(user.get('hat.id'), 3);
    assert.ok(user.get('hatIsDirty'));
    user.rollbackHat();
    assert.equal(user.get('hat.id'), 2);
    assert.ok(user.get('hatIsNotDirty'));
    user.change_hat(3);
    assert.equal(user.get('hat.id'), 3);
    assert.ok(user.get('hatIsDirty'));
    user.saveHat();
    assert.equal(user.get('hat.id'), 3);
    assert.ok(user.get('hatIsNotDirty'));
});

test('hat will save correctly as undefined', (assert) => {
    user = store.push('user', {id: 1, hat_fk: undefined});
    store.push('hat', {id: 2, users: []});
    user.saveHat();
    let hat = user.get('hat');
    assert.equal(user.get('hat_fk'), undefined);
});
