import Ember from 'ember';
import { test, module } from 'qunit';
import regex_property from 'bsrs-ember/utilities/regex-property';

module('regex-property unit tests');

test('will return false when regex is not a match for single property', function(assert) {
    const object = Ember.Object.create({name: 'xyz'});
    const property = 'name';
    const regex = new RegExp('wat');
    assert.equal(regex_property(object, property, regex), false);
});

test('will return true when regex is a match for single property (LOWERCASE)', function(assert) {
    const object = Ember.Object.create({name: 'wat'});
    const property = 'name';
    const regex = new RegExp('wat');
    assert.equal(regex_property(object, property, regex), true);
});

test('will return true when regex is a match for number (not string type))', function(assert) {
    const object = Ember.Object.create({number: 1});
    const property = 'number';
    const regex = new RegExp('1');
    assert.equal(regex_property(object, property, regex), true);
});

test('will return true when regex is a match for single property (UPPERCASE)', function(assert) {
    const object = Ember.Object.create({name: 'XYZ'});
    const property = 'name';
    const regex = new RegExp('x');
    assert.equal(regex_property(object, property, regex), true);
});

test('will return false when regex tries to match a null property', function(assert) {
    const object = Ember.Object.create({name: 'xyz'});
    const property = 'unknown';
    const regex = new RegExp('x');
    assert.equal(regex_property(object, property, regex), false);
});

test('will return true when regex is a match on nested object property', function(assert) {
    const nested = Ember.Object.create({name: 'xyz'});
    const object = Ember.Object.create({foo: nested});
    const property = 'foo.name';
    const regex = new RegExp('x');
    assert.equal(regex_property(object, property, regex), true);
});

test('will return false when regex is not a match on nested object property', function(assert) {
    const nested = Ember.Object.create({name: 'xyz'});
    const object = Ember.Object.create({foo: nested});
    const property = 'foo.name';
    const regex = new RegExp('a');
    assert.equal(regex_property(object, property, regex), false);
});

/* categories[name] is not application anymore.  Leaving tests commented out for now.
* search for categories[name] if need reference again in future
*/

// test('will return true when regex is a match on last array object property', function(assert) {
//     const one = Ember.Object.create({name: 'ab'});
//     const two = Ember.Object.create({name: 'cd'});
//     const three = Ember.Object.create({name: 'ef'});
//     const object = Ember.Object.create({categories: Ember.A([one, two, three])});
//     const property = 'categories[name]';
//     const regex = new RegExp('f');
//     assert.equal(regex_property(object, property, regex), true);
// });

// test('will return true when regex is a match on middle array object property', function(assert) {
//     const one = Ember.Object.create({name: 'ab'});
//     const two = Ember.Object.create({name: 'cd'});
//     const three = Ember.Object.create({name: 'ef'});
//     const object = Ember.Object.create({categories: Ember.A([one, two, three])});
//     const property = 'categories[name]';
//     const regex = new RegExp('d');
//     assert.equal(regex_property(object, property, regex), true);
// });

// test('will return true when regex is a match on first array object property', function(assert) {
//     const one = Ember.Object.create({name: 'ab'});
//     const two = Ember.Object.create({name: 'cd'});
//     const three = Ember.Object.create({name: 'ef'});
//     const object = Ember.Object.create({categories: Ember.A([one, two, three])});
//     const property = 'categories[name]';
//     const regex = new RegExp('a');
//     assert.equal(regex_property(object, property, regex), true);
// });

// test('will return false when regex is not a match on any array object property', function(assert) {
//     const one = Ember.Object.create({name: 'ab'});
//     const two = Ember.Object.create({name: 'cd'});
//     const three = Ember.Object.create({name: 'ef'});
//     const object = Ember.Object.create({categories: Ember.A([one, two, three])});
//     const property = 'categories[name]';
//     const regex = new RegExp('z');
//     assert.equal(regex_property(object, property, regex), false);
// });

// test('will return true when regex is a match on any array object property (UPPERCASE)', function(assert) {
//     const one = Ember.Object.create({name: 'AB'});
//     const two = Ember.Object.create({name: 'CD'});
//     const three = Ember.Object.create({name: 'EF'});
//     const object = Ember.Object.create({categories: Ember.A([one, two, three])});
//     const property = 'categories[name]';
//     const regex = new RegExp('c');
//     assert.equal(regex_property(object, property, regex), true);
// });

// test('will return false when regex tries to match a null property on array object property', function(assert) {
//     const one = Ember.Object.create({name: 'ab'});
//     const two = Ember.Object.create({name: 'cd'});
//     const three = Ember.Object.create({name: 'ef'});
//     const object = Ember.Object.create({categories: Ember.A([one, two, three])});
//     const property = 'categories[hat]';
//     const regex = new RegExp('c');
//     assert.equal(regex_property(object, property, regex), false);
// });
