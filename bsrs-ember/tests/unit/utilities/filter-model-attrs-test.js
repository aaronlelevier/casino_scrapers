import Ember from 'ember';
import { test, module } from 'qunit';
import set_filter_model_attrs from 'bsrs-ember/utilities/filter-model-attrs';

module('unit: filter model attrs test');

test('when query is undefined any param set on the filter model is reset to undefined', function(assert) {
    var filterModel = Ember.Object.create({name: 'x', role: 'y', random: 'z'});
    set_filter_model_attrs(filterModel, undefined);
    assert.equal(filterModel.get('name'), undefined);
    assert.equal(filterModel.get('role'), undefined);
    assert.equal(filterModel.get('random'), undefined);
});

test('when user backspaces and clears out filter, it resets filterModel', function(assert) {
    const query = 'name:';
    var filterModel = Ember.Object.create({name: 'x', role: 'y', random: 'z'});
    set_filter_model_attrs(filterModel, query);
    assert.equal(filterModel.get('name'), undefined);
    assert.equal(filterModel.get('role'), 'y');
    assert.equal(filterModel.get('random'), 'z');
});

test('when user backspaces related model, it will update filterModel appropriately', function(assert) {
    var query = 'name:x,role.name:,random:zap';
    var filterModel = Ember.Object.create({role: {name:'y'}, random: 'z'});
    set_filter_model_attrs(filterModel, query);
    assert.equal(filterModel.get('name'), 'x');
    assert.equal(filterModel.get('role.name'), undefined);
    assert.equal(filterModel.get('random'), 'zap');
});

test('when query is legit the filter model is updated appropriately', function(assert) {
    var query = 'name:wat';
    var filterModel = Ember.Object.create({name: 'x', role: 'y', random: 'z'});
    set_filter_model_attrs(filterModel, query);
    assert.equal(filterModel.get('name'), 'wat');
    assert.equal(filterModel.get('role'), 'y');
    assert.equal(filterModel.get('random'), 'z');
});

test('complex query will break apart and the filter model will be updated appropriately', function(assert) {
    var query = 'role:huh,name:x,random:zap';
    var filterModel = Ember.Object.create({role: 'y', random: 'z'});
    set_filter_model_attrs(filterModel, query);
    assert.equal(filterModel.get('name'), 'x');
    assert.equal(filterModel.get('role'), 'huh');
    assert.equal(filterModel.get('random'), 'zap');
});

test('complex query with related will break apart and the filter model will be updated appropriately', function(assert) {
    var query = 'name:x,role.name:huh,random:zap';
    var filterModel = Ember.Object.create({role: {name:'y'}, random: 'z'});
    set_filter_model_attrs(filterModel, query);
    assert.equal(filterModel.get('name'), 'x');
    assert.equal(filterModel.get('role.name'), 'huh');
    assert.equal(filterModel.get('random'), 'zap');
});

test('related works when not already existing in filterModel object as a key', function(assert) {
    var query = 'name:x,role.name:huh,random:zap';
    var filterModel = Ember.Object.create();
    set_filter_model_attrs(filterModel, query);
    assert.equal(filterModel.get('name'), 'x');
    assert.equal(filterModel.get('role.name'), 'huh');
    assert.equal(filterModel.get('random'), 'zap');
});
