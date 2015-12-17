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

test('array field is sorted correctly when the items are in reverse order', function(assert) {
    var one = Ember.Object.create({name: 'z'});
    var two = Ember.Object.create({name: 'c'});
    var four = Ember.Object.create({name: 'a'});
    var five = Ember.Object.create({name: 'x'});
    var items = [
        Ember.Object.create({name:'a', categories: [one, two]}),
        Ember.Object.create({name:'a', categories: [four, five]})
    ];
    var expected = [
        Ember.Object.create({name:'a', categories: [four, five]}),
        Ember.Object.create({name:'a', categories: [one, two]})
    ];
    var options = ['categories[name]'];
    var result = MultiSort.run(items, options);
    assert.deepEqual(result, expected);
});

test('array field is not sorted when the data is already in the correct order', function(assert) {
    var one = Ember.Object.create({name: 'z'});
    var two = Ember.Object.create({name: 'c'});
    var four = Ember.Object.create({name: 'a'});
    var five = Ember.Object.create({name: 'x'});
    var items = [
        Ember.Object.create({name:'a', categories: [four, five]}),
        Ember.Object.create({name:'a', categories: [one, two]})
    ];
    var expected = [
        Ember.Object.create({name:'a', categories: [four, five]}),
        Ember.Object.create({name:'a', categories: [one, two]})
    ];
    var options = ['categories[name]'];
    var result = MultiSort.run(items, options);
    assert.deepEqual(result, expected);
});

test('array field is sorted correctly when the items have the same top level but middle is in reverse order', function(assert) {
    var one = Ember.Object.create({name: 'a'});
    var two = Ember.Object.create({name: 'd'});
    var three = Ember.Object.create({name: 'e'});
    var four = Ember.Object.create({name: 'a'});
    var five = Ember.Object.create({name: 'b'});
    var six = Ember.Object.create({name: 'c'});
    var items = [
        Ember.Object.create({name:'a', categories: [one, two, three]}),
        Ember.Object.create({name:'a', categories: [four, five, six]})
    ];
    var expected = [
        Ember.Object.create({name:'a', categories: [four, five, six]}),
        Ember.Object.create({name:'a', categories: [one, two, three]})
    ];
    var options = ['categories[name]'];
    var result = MultiSort.run(items, options);
    assert.deepEqual(result, expected);
});

test('array field is not sorted when the items are in the correct order including the middle node', function(assert) {
    var one = Ember.Object.create({name: 'a'});
    var two = Ember.Object.create({name: 'd'});
    var three = Ember.Object.create({name: 'e'});
    var four = Ember.Object.create({name: 'a'});
    var five = Ember.Object.create({name: 'b'});
    var six = Ember.Object.create({name: 'c'});
    var items = [
        Ember.Object.create({name:'a', categories: [four, five, six]}),
        Ember.Object.create({name:'a', categories: [one, two, three]})
    ];
    var expected = [
        Ember.Object.create({name:'a', categories: [four, five, six]}),
        Ember.Object.create({name:'a', categories: [one, two, three]})
    ];
    var options = ['categories[name]'];
    var result = MultiSort.run(items, options);
    assert.deepEqual(result, expected);
});

test('array field is sorted correctly with multiple items that start in reverse order', function(assert) {
    var one = Ember.Object.create({name: 'a'});
    var two = Ember.Object.create({name: 'd'});
    var three = Ember.Object.create({name: 'f'});
    var four = Ember.Object.create({name: 'b'});
    var five = Ember.Object.create({name: 'e'});
    var six = Ember.Object.create({name: 'g'});
    var seven = Ember.Object.create({name: 'c'});
    var eight = Ember.Object.create({name: 'x'});
    var nine = Ember.Object.create({name: 'y'});
    var items = [
        Ember.Object.create({name:'a', categories: [seven, eight, nine]}),
        Ember.Object.create({name:'a', categories: [four, five, six]}),
        Ember.Object.create({name:'a', categories: [one, two, three]})
    ];
    var expected = [
        Ember.Object.create({name:'a', categories: [one, two, three]}),
        Ember.Object.create({name:'a', categories: [four, five, six]}),
        Ember.Object.create({name:'a', categories: [seven, eight, nine]})
    ];
    var options = ['categories[name]'];
    var result = MultiSort.run(items, options);
    assert.deepEqual(result, expected);
});

test('array field is sorted correctly when top level matches but middle is out of order', function(assert) {
    var one = Ember.Object.create({name: 'a'});
    var two = Ember.Object.create({name: 'l'});
    var three = Ember.Object.create({name: 'o'});
    var four = Ember.Object.create({name: 'a'});
    var five = Ember.Object.create({name: 'r'});
    var six = Ember.Object.create({name: 'n'});
    var seven = Ember.Object.create({name: 'a'});
    var eight = Ember.Object.create({name: 'l'});
    var nine = Ember.Object.create({name: 'm'});
    var items = [
        Ember.Object.create({name:'a', categories: [seven, eight, nine]}),
        Ember.Object.create({name:'a', categories: [four, five, six]}),
        Ember.Object.create({name:'a', categories: [one, two, three]})
    ];
    var expected = [
        Ember.Object.create({name:'a', categories: [seven, eight, nine]}),
        Ember.Object.create({name:'a', categories: [one, two, three]}),
        Ember.Object.create({name:'a', categories: [four, five, six]})
    ];
    var options = ['categories[name]'];
    var result = MultiSort.run(items, options);
    assert.deepEqual(result, expected);
});

test('array field is not sorted when the items are in the correct order including the middle node (3 items in record set)', function(assert) {
    var one = Ember.Object.create({name: 'a'});
    var two = Ember.Object.create({name: 'l'});
    var three = Ember.Object.create({name: 'o'});
    var four = Ember.Object.create({name: 'a'});
    var five = Ember.Object.create({name: 'l'});
    var six = Ember.Object.create({name: 'n'});
    var seven = Ember.Object.create({name: 'a'});
    var eight = Ember.Object.create({name: 'l'});
    var nine = Ember.Object.create({name: 'm'});
    var items = [
        Ember.Object.create({name:'a', categories: [seven, eight, nine]}),
        Ember.Object.create({name:'a', categories: [four, five, six]}),
        Ember.Object.create({name:'a', categories: [one, two, three]})
    ];
    var expected = [
        Ember.Object.create({name:'a', categories: [seven, eight, nine]}),
        Ember.Object.create({name:'a', categories: [four, five, six]}),
        Ember.Object.create({name:'a', categories: [one, two, three]})
    ];
    var options = ['categories[name]'];
    var result = MultiSort.run(items, options);
    assert.deepEqual(result, expected);
});

test('array field is sorted correctly when top level and middle matches but middle is missing leaf node', function(assert) {
    var one = Ember.Object.create({name: 'a'});
    var two = Ember.Object.create({name: 'l'});
    var three = Ember.Object.create({name: 'o'});
    var four = Ember.Object.create({name: 'a'});
    var five = Ember.Object.create({name: 'l'});
    var seven = Ember.Object.create({name: 'a'});
    var eight = Ember.Object.create({name: 'l'});
    var nine = Ember.Object.create({name: 'm'});
    var items = [
        Ember.Object.create({name:'a', categories: [seven, eight, nine]}),
        Ember.Object.create({name:'a', categories: [four, five]}),
        Ember.Object.create({name:'a', categories: [one, two, three]})
    ];
    var expected = [
        Ember.Object.create({name:'a', categories: [four, five]}),
        Ember.Object.create({name:'a', categories: [seven, eight, nine]}),
        Ember.Object.create({name:'a', categories: [one, two, three]})
    ];
    var options = ['categories[name]'];
    var result = MultiSort.run(items, options);
    assert.deepEqual(result, expected);
});

test('array field is sorted correctly when top level and middle matches but middle is missing leaf node (and top item should be bottom)', function(assert) {
    var one = Ember.Object.create({name: 'a'});
    var two = Ember.Object.create({name: 'l'});
    var three = Ember.Object.create({name: 'o'});
    var four = Ember.Object.create({name: 'a'});
    var five = Ember.Object.create({name: 'l'});
    var seven = Ember.Object.create({name: 'a'});
    var eight = Ember.Object.create({name: 'l'});
    var nine = Ember.Object.create({name: 'm'});
    var items = [
        Ember.Object.create({name:'a', categories: [one, two, three]}),
        Ember.Object.create({name:'a', categories: [four, five]}),
        Ember.Object.create({name:'a', categories: [seven, eight, nine]})
    ];
    var expected = [
        Ember.Object.create({name:'a', categories: [four, five]}),
        Ember.Object.create({name:'a', categories: [seven, eight, nine]}),
        Ember.Object.create({name:'a', categories: [one, two, three]})
    ];
    var options = ['categories[name]'];
    var result = MultiSort.run(items, options);
    assert.deepEqual(result, expected);
});

test('array field is sorted correctly when top level and middle matches but only 1 has a leaf node', function(assert) {
    var one = Ember.Object.create({name: 'b'});
    var two = Ember.Object.create({name: 'z'});
    var four = Ember.Object.create({name: 'c'});
    var five = Ember.Object.create({name: 'x'});
    var seven = Ember.Object.create({name: 'a'});
    var eight = Ember.Object.create({name: 'c'});
    var nine = Ember.Object.create({name: 'e'});
    var items = [
        Ember.Object.create({name:'a', categories: [one, two]}),
        Ember.Object.create({name:'a', categories: [four, five]}),
        Ember.Object.create({name:'a', categories: [seven, eight, nine]})
    ];
    var expected = [
        Ember.Object.create({name:'a', categories: [seven, eight, nine]}),
        Ember.Object.create({name:'a', categories: [one, two]}),
        Ember.Object.create({name:'a', categories: [four, five]})
    ];
    var options = ['categories[name]'];
    var result = MultiSort.run(items, options);
    assert.deepEqual(result, expected);
});

test('array field is sorted correctly when first sorted by another non array property', function(assert) {
    var one = Ember.Object.create({name: 'b'});
    var two = Ember.Object.create({name: 'z'});
    var four = Ember.Object.create({name: 'c'});
    var five = Ember.Object.create({name: 'x'});
    var seven = Ember.Object.create({name: 'a'});
    var eight = Ember.Object.create({name: 'c'});
    var nine = Ember.Object.create({name: 'e'});
    var items = [
        Ember.Object.create({name:'z', categories: [one, two]}),
        Ember.Object.create({name:'a', categories: [four, five]}),
        Ember.Object.create({name:'a', categories: [seven, eight, nine]})
    ];
    var expected = [
        Ember.Object.create({name:'a', categories: [seven, eight, nine]}),
        Ember.Object.create({name:'a', categories: [four, five]}),
        Ember.Object.create({name:'z', categories: [one, two]})
    ];
    var options = ['name', 'categories[name]'];
    var result = MultiSort.run(items, options);
    assert.deepEqual(result, expected);
});
