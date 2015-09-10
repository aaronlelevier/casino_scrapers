import Ember from 'ember';
import { test, module } from 'qunit';
import MultiSort from 'bsrs-ember/utilities/sort';

module('sort unit tests');

test('transform will take columns with direction and modify it to the sort equivalent', function(assert) {
    var expected = {
        total: -1, count: 1, random: 1
    };
    var options = ['-total', 'count', 'random'];
    var result = MultiSort.transform(options);
    assert.deepEqual(result, expected);
});

test('precedence will return the order in which each key will be sorted', function(assert) {
    var sortBy = {
        total: -1, count: 1, random: 1
    };
    var result = MultiSort.precedence(sortBy, 0);
    assert.equal(result, 'total');
    result = MultiSort.precedence(sortBy, 1);
    assert.equal(result, 'count');
    result = MultiSort.precedence(sortBy, 2);
    assert.equal(result, 'random');
    result = MultiSort.precedence(sortBy, 3);
    assert.equal(result, undefined);
});

test('isNumber will return true for numbers, false for non numeric', function(assert) {
    assert.equal(MultiSort.isNumber(-1), true);
    assert.equal(MultiSort.isNumber(1), true);
    assert.equal(MultiSort.isNumber('1'), true);
    assert.equal(MultiSort.isNumber(null), false);
    assert.equal(MultiSort.isNumber(undefined), false);
    assert.equal(MultiSort.isNumber(''), false);
    assert.equal(MultiSort.isNumber('one'), false);
    assert.equal(MultiSort.isNumber('' + 2), true);
    assert.equal(MultiSort.isNumber('139543cf-8fea-426a-8bc3-09778cd79901'), false);
});

test('size will return number of keys to sort on', function(assert) {
    var sortBy = {
        total: -1, count: 1, random: 1
    };
    var result = MultiSort.size(sortBy);
    assert.equal(result, 3);
});

test('should sort array of objects by multiple keys ignoring keys not present', function(assert) {
    var items = [
        Ember.Object.create({name:'brown',  total:2000, count:32, random:16, abbr:'US'}),
        Ember.Object.create({name:'jake', total:4000, count:35, random:16, abbr:'DE'}),
        Ember.Object.create({name:'tiny',  total:1000, count:30, random:17, abbr:'UK'}),
        Ember.Object.create({name:'main', total:1500, count:31, random:19, abbr:'PL'}),
        Ember.Object.create({name:'john',  total:2500, count:33, random:18, abbr:'US'}),
        Ember.Object.create({name:'sam',total:2000, count:30, random:16, abbr:'CA'}),
        Ember.Object.create({name:'zap', total:3000, count:34, random:19, abbr:'RU'}),
        Ember.Object.create({name:'animal',total:2500, count:32, random:17, abbr:'LV'}),
        Ember.Object.create({name:'maii', total:2000, count:30, random:18, abbr:'DE'}),
        Ember.Object.create({name:'amy',  total:1500, count:29, random:19, abbr:'UK'})
    ];
    var expected = [
        Ember.Object.create({name:'jake', total:4000, count:35, random:16, abbr:'DE'}),
        Ember.Object.create({name:'zap', total:3000, count:34, random:19, abbr:'RU'}),
        Ember.Object.create({name:'animal',total:2500, count:32, random:17, abbr:'LV'}),
        Ember.Object.create({name:'john',  total:2500, count:33, random:18, abbr:'US'}),
        Ember.Object.create({name:'sam',total:2000, count:30, random:16, abbr:'CA'}),
        Ember.Object.create({name:'maii', total:2000, count:30, random:18, abbr:'DE'}),
        Ember.Object.create({name:'brown',  total:2000, count:32, random:16, abbr:'US'}),
        Ember.Object.create({name:'amy',  total:1500, count:29, random:19, abbr:'UK'}),
        Ember.Object.create({name:'main', total:1500, count:31, random:19, abbr:'PL'}),
        Ember.Object.create({name:'tiny',  total:1000, count:30, random:17, abbr:'UK'})
    ];
    var options = ['-total', 'count', 'random'];
    var result = MultiSort.run(items, options);
    assert.deepEqual(result, expected);
});

test('will sort uuid values correctly', function(assert) {
    var items = [
        Ember.Object.create({id:'139543cf-8fea-426a-8bc3-09778cd79901', name:'mgibson1'}),
        Ember.Object.create({id:'139543cf-8fea-426a-8bc3-09778cd79903', name:'mgibson3'}),
        Ember.Object.create({id:'139543cf-8fea-426a-8bc3-09778cd79902', name:'mgibson2'})
    ];
    var result = MultiSort.run(items, ['-id']);
    assert.equal(result[0].get('id'), '139543cf-8fea-426a-8bc3-09778cd79903');
    assert.equal(result[1].get('id'), '139543cf-8fea-426a-8bc3-09778cd79902');
    assert.equal(result[2].get('id'), '139543cf-8fea-426a-8bc3-09778cd79901');
});

test('will sort null values without exception', function(assert) {
    var items = [
        Ember.Object.create({id:'139543cf-8fea-426a-8bc3-09778cd79901', name:'mgibson1'}),
        Ember.Object.create({id:'139543cf-8fea-426a-8bc3-09778cd79903', name:null}),
        Ember.Object.create({id:'139543cf-8fea-426a-8bc3-09778cd79902', name:'mgibson2'})
    ];
    var result = MultiSort.run(items, ['name']);
    assert.equal(result[0].get('name'), null);
    assert.equal(result[1].get('name'), 'mgibson1');
    assert.equal(result[2].get('name'), 'mgibson2');
});
