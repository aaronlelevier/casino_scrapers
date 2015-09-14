import {test, module} from 'qunit';
import PersonListComponent from "bsrs-ember/components/person-list/component";
import Ember from 'ember';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import PEOPLE_DEFAULTS from 'bsrs-ember/vendor/defaults/person';

var registry, container, store, eventbus;

module('unit: person-list', {
    beforeEach() {
        registry = new Ember.Registry();
        container = registry.container();
        store = module_registry(container, registry, ['model:person', 'service:eventbus']);
        eventbus = container.lookup('service:eventbus');
    },
    afterEach() {
        eventbus = null;
        container = null;
        registry = null;
        store = null;
    }
});
test('knows how to sort a list of people even when sortable column is null', (assert) => {
    store.push('person', {id: 2, first_name: PEOPLE_DEFAULTS.first_name, username: PEOPLE_DEFAULTS.username, title: PEOPLE_DEFAULTS.title});
    var subject = PersonListComponent.create({model: store.find('person'), eventbus: eventbus});
    var people = subject.get('searched_content');
    assert.equal(people.get('length'), 1);
    store.push('person', {id: 1, username: 'wat', title: PEOPLE_DEFAULTS.title});
    people = subject.get('searched_content');
    assert.equal(people.get('length'), 2);
    store.push('person', {id: 3, username: 'wat', first_name: PEOPLE_DEFAULTS.first_name});
    people = subject.get('searched_content');
    assert.equal(people.get('length'), 3);
});

test('sorted content is sorted by id if no other value is specified and breaks cache when sort is updated', (assert) => {
    store.push('person', {id: 3, username: 'abc', first_name: PEOPLE_DEFAULTS.first_name});
    store.push('person', {id: 1, username: 'def', title: PEOPLE_DEFAULTS.title});
    store.push('person', {id: 2, first_name: PEOPLE_DEFAULTS.first_name, username: 'zzz', title: PEOPLE_DEFAULTS.title});
    var subject = PersonListComponent.create({model: store.find('person'), eventbus: eventbus});
    var people = subject.get('sorted_content');
    assert.equal(people.objectAt(0).get('id'), 1);
    assert.equal(people.objectAt(1).get('id'), 2);
    assert.equal(people.objectAt(2).get('id'), 3);
    subject.set('sort', 'username');
    people = subject.get('sorted_content');
    assert.equal(people.objectAt(0).get('id'), 3);
    assert.equal(people.objectAt(1).get('id'), 1);
    assert.equal(people.objectAt(2).get('id'), 2);
    store.push('person', {id: 4, username: 'babel', first_name: PEOPLE_DEFAULTS.first_name});
    people = subject.get('sorted_content');
    assert.equal(people.objectAt(0).get('id'), 3);
    assert.equal(people.objectAt(1).get('id'), 4);
    assert.equal(people.objectAt(2).get('id'), 1);
    assert.equal(people.objectAt(3).get('id'), 2);
});

test('given a list of people and page number, should only return those people on that page', (assert) => {
    store.push('person', {id: 3, username: 'abc'});
    store.push('person', {id: 1, username: 'def'});
    store.push('person', {id: 2, username: 'zzz'});
    var subject = PersonListComponent.create({model: store.find('person'), itemsPerPage: 2, eventbus: eventbus});
    var people = subject.get('paginated_content');
    assert.equal(people.get('length'), 2);
    subject.set('page', 2);
    people = subject.get('paginated_content');
    assert.equal(people.get('length'), 1);
    store.push('person', {id: 4, username: 'yehuda'});
    people = subject.get('paginated_content');
    assert.equal(people.get('length'), 2);
});

test('given a list of people and page number, should only return those people on that page (4 people)', (assert) => {
    store.push('person', {id: 3, username: 'abc'});
    store.push('person', {id: 1, username: 'def'});
    store.push('person', {id: 2, username: 'zzz'});
    store.push('person', {id: 4, username: 'crb'});
    var model = store.find('person');
    model.set('count', 4);
    var subject = PersonListComponent.create({model: model, itemsPerPage: 2, eventbus: eventbus});
    var pages = subject.get('pages');
    assert.equal(pages.get('length'), 2);
    model.set('count', 5);
    store.push('person', {id: 5, username: 'drb'});
    pages = subject.get('pages');
    assert.equal(pages.get('length'), 3);
});

test('searched content allows you to look through searchable keys and filter accordingly', (assert) => {
    store.push('person', {id: 1, first_name: 'ab', username: 'x', title: 'scott newcomer'});
    store.push('person', {id: 2, first_name: 'cd', username: 'y', title: 'toran lillups'});
    store.push('person', {id: 3, first_name: 'de', username: 'z', title: 'aaron lelevier'});
    var subject = PersonListComponent.create({model: store.find('person'), eventbus: eventbus});
    var people = subject.get('searched_content');
    assert.deepEqual(subject.get('searchable'), ['first_name', 'title']);
    assert.equal(people.get('length'), 3);
    subject.set('search', 'scot'); 
    people = subject.get('searched_content');
    assert.equal(people.get('length'), 1);
    assert.equal(people.objectAt(0).get('title'), 'scott newcomer');
    subject.set('search', ''); 
    people = subject.get('searched_content');
    assert.equal(people.get('length'), 3);
    subject.set('search', 'x'); 
    people = subject.get('searched_content');
    assert.equal(people.get('length'), 0);
    subject.set('search', 'd'); 
    people = subject.get('searched_content');
    assert.equal(people.get('length'), 2);
    assert.equal(people.objectAt(0).get('id'), 2);
    assert.equal(people.objectAt(1).get('id'), 3);
    subject.set('search', 'c'); 
    people = subject.get('searched_content');
    assert.equal(people.get('length'), 2);
    assert.equal(people.objectAt(0).get('id'), 2);
    assert.equal(people.objectAt(1).get('id'), 1);
    store.push('person', {id: 4, first_name: 'mmm', username: 'n', title: 'cup lelevier'});
    people = subject.get('searched_content');
    assert.equal(people.get('length'), 3);
    assert.equal(people.objectAt(0).get('id'), 2);
    assert.equal(people.objectAt(1).get('id'), 1);
    assert.equal(people.objectAt(2).get('id'), 4);
    subject.set('search', 'n l'); 
    people = subject.get('searched_content');
    assert.equal(people.get('length'), 2);
    assert.equal(people.objectAt(0).get('id'), 2);
    assert.equal(people.objectAt(1).get('id'), 3);
    // subject.set('search', 'n ');  //TRIM!
    // people = subject.get('searched_content');
    // assert.equal(people.get('length'), 2);
    // assert.equal(people.objectAt(0).get('id'), 2);
    // assert.equal(people.objectAt(1).get('id'), 3);
});

test('found content allows you to look through searchable keys and filter accordingly', (assert) => {
    store.push('person', {id: 1, first_name: 'ab', username: 'azd', title: 'scott newcomer'});
    store.push('person', {id: 2, first_name: 'cd', username: 'yzq', title: 'toran billups'});
    store.push('person', {id: 3, first_name: 'de', username: 'zed', title: 'aaron lelevier'});
    var subject = PersonListComponent.create({model: store.find('person'), eventbus: eventbus});
    var people = subject.get('found_content');
    assert.equal(people.get('length'), 3);
    subject.set('find', 'title:sco');
    people = subject.get('found_content');
    assert.equal(people.get('length'), 1);
    assert.equal(people.objectAt(0).get('title'), 'scott newcomer');
    subject.set('find', 'title:sco,username:z');
    people = subject.get('found_content');
    assert.equal(people.get('length'), 1);
    assert.equal(people.objectAt(0).get('title'), 'scott newcomer');
    subject.set('find', 'title:sco,username:ze');
    people = subject.get('found_content');
    assert.equal(people.get('length'), 0);
    subject.set('find', 'title:,username:z');
    people = subject.get('found_content');
    assert.equal(people.get('length'), 3);
});

test('found will filter out null objects when that column is searched on explicitly', (assert) => {
    store.push('person', {id: 1, username: 'aaron', title: 'abz'});
    store.push('person', {id: 2, username: 'aute', title: 'abc'});
    store.push('person', {id: 3, username: 'veniam', title: null});
    store.push('person', {id: 4, username: 'cupidatat', title: null});
    store.push('person', {id: 5, username: 'laborum.', title: null});
    store.push('person', {id: 6, username: 'pariatur', title: null});
    store.push('person', {id: 7, username: 'voluptate', title: null});
    store.push('person', {id: 8, username: 'adipisicing', title: null});
    var subject = PersonListComponent.create({model: store.find('person'), eventbus: eventbus});
    subject.set('find', 'username:a');
    var people = subject.get('found_content');
    assert.equal(people.get('length'), 8);
    subject.set('find', 'title:ab,username:a');
    people = subject.get('found_content');
    assert.equal(people.get('length'), 2);
    assert.equal(people.objectAt(0).get('id'), 1);
    assert.equal(people.objectAt(1).get('id'), 2);
    subject.set('find', 'title:ab,username:aa');
    people = subject.get('found_content');
    assert.equal(people.get('length'), 1);
    assert.equal(people.objectAt(0).get('id'), 1);
});

test('found filter will only match those exactly in all columns', (assert) => {
    store.push('person', {id: 1, foo: 'baa', username: 'xyzz', title: 'deaa'});
    store.push('person', {id: 2, foo: 'bab', username: 'xyyy', title: 'deaa'});
    store.push('person', {id: 3, foo: 'babc', username: 'xyyx', title: 'deaa'});
    store.push('person', {id: 4, foo: 'babcd', username: 'xyyw', title: 'deaa'});
    store.push('person', {id: 5, foo: 'babcde', username: 'xyyv1', title: 'deaab'});
    store.push('person', {id: 6, foo: 'babcde', username: 'xyyv2', title: 'deaabc'});
    store.push('person', {id: 7, foo: 'babcde', username: 'xyyv3', title: 'deaabcd'});
    store.push('person', {id: 8, foo: 'babcdeq', username: 'xyyv4', title: 'deaabcde'});
    var subject = PersonListComponent.create({model: store.find('person'), eventbus: eventbus});
    subject.set('find', 'username:x');
    var people = subject.get('found_content');
    assert.equal(people.get('length'), 8);
    subject.set('find', 'username:x,foo:ba');
    people = subject.get('found_content');
    assert.equal(people.get('length'), 8);
    subject.set('find', 'username:x,foo:bab');
    people = subject.get('found_content');
    assert.equal(people.get('length'), 7);
    subject.set('find', 'username:x,foo:bab,title:dea');
    people = subject.get('found_content');
    assert.equal(people.get('length'), 7);
    subject.set('find', 'username:xyyv,foo:bab,title:dea');
    people = subject.get('found_content');
    assert.equal(people.get('length'), 4);
    subject.set('find', 'username:xyyv,foo:bab,title:dea');
    people = subject.get('found_content');
    assert.equal(people.get('length'), 4);
    subject.set('find', 'username:xyyv,foo:babc,title:dea');
    people = subject.get('found_content');
    assert.equal(people.get('length'), 4);
    subject.set('find', 'username:xyyv,foo:babc,title:deaabc');
    people = subject.get('found_content');
    assert.equal(people.get('length'), 3);
    subject.set('find', 'username:xyyv,foo:babcdeq,title:deaabc');
    people = subject.get('found_content');
    assert.equal(people.get('length'), 1);
    assert.equal(people.objectAt(0).get('id'), 8);
    subject.set('find', 'username:xyyv,foo:babcdeqr,title:deaabc');
    people = subject.get('found_content');
    assert.equal(people.get('length'), 0);
});
