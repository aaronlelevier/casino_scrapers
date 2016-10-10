import Ember from 'ember';
const { run } = Ember;
import { moduleForComponent, test } from 'ember-qunit';
import PEOPLE_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';

var proxy = function() {
    return Ember.ArrayProxy.extend({
        content: Ember.computed(function () {
            return Ember.A(this.get('source'));
        }).property()
    }).create({
        source: []
    });
};

var columns = [
    {field: 'fullname', headerLabel: 'Name', isSortable: true, isFilterable: true, isSearchable: true},
    {field: 'username', headerLabel: 'Username', isSortable: true, isFilterable: true, isSearchable: true},
    {field: 'title', headerLabel: 'Title', isSortable: true, isFilterable: true, isSearchable: true}
];

var columns_with_role = [
    {field: 'fullname', headerLabel: 'Name', isSortable: true, isFilterable: true, isSearchable: true},
    {field: 'username', headerLabel: 'Username', isSortable: true, isFilterable: true, isSearchable: true},
    {field: 'title', headerLabel: 'Title', isSortable: true, isFilterable: true, isSearchable: true},
    {field: 'role.name', headerLabel: 'Role', isSortable: true, isFilterable: true, isSearchable: true}
];

var store, eventbus, requested;

moduleForComponent('grid/helpers/grid-body', 'Unit | Component | grid/helpers/grid body', {
    // Specify the other units that are required for this test
    // needs: ['component:foo', 'helper:bar'],
    unit: true,
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:person', 'service:eventbus', 'model:role']);
        eventbus = this.container.lookup('service:eventbus');
        requested = proxy();
    }
});

// test('knows how to sort a list of people even when sortable column is null', function(assert) {
//     store.push('person', {id: 2, first_name: PEOPLE_DEFAULTS.first_name, username: PEOPLE_DEFAULTS.username, title: PEOPLE_DEFAULTS.title});
//     var subject = this.subject({model: store.find('person'), eventbus: eventbus, columns: columns});
//     var people = subject.get('searched_content');
//     assert.equal(people.get('length'), 1);
//     store.push('person', {id: 1, username: 'wat', title: PEOPLE_DEFAULTS.title});
//     people = subject.get('searched_content');
//     assert.equal(people.get('length'), 2);
//     store.push('person', {id: 3, username: 'wat', first_name: PEOPLE_DEFAULTS.first_name, last_name: ''});
//     people = subject.get('searched_content');
//     assert.equal(people.get('length'), 3);
// });

// test('sorted content is sorted by the defaultSort provided if no other value is specified and breaks cache when sort is updated', function(assert) {
//     store.push('person', {id: 3, username: 'abc', first_name: PEOPLE_DEFAULTS.first_name, last_name: ''});
//     store.push('person', {id: 1, username: 'def', title: PEOPLE_DEFAULTS.title});
//     store.push('person', {id: 2, first_name: PEOPLE_DEFAULTS.first_name, username: 'zzz', title: PEOPLE_DEFAULTS.title});
//     var subject = this.subject({model: store.find('person'), eventbus: eventbus, defaultSort: ['id'], columns: columns});
//     var people = subject.get('sorted_content');
//     assert.equal(people.objectAt(0).get('id'), 1);
//     assert.equal(people.objectAt(1).get('id'), 2);
//     assert.equal(people.objectAt(2).get('id'), 3);
//     subject.set('sort', 'username');
//     people = subject.get('sorted_content');
//     assert.equal(people.objectAt(0).get('id'), 3);
//     assert.equal(people.objectAt(1).get('id'), 1);
//     assert.equal(people.objectAt(2).get('id'), 2);
//     store.push('person', {id: 4, username: 'babel', first_name: PEOPLE_DEFAULTS.first_name});
//     people = subject.get('sorted_content');
//     assert.equal(people.objectAt(0).get('id'), 3);
//     assert.equal(people.objectAt(1).get('id'), 4);
//     assert.equal(people.objectAt(2).get('id'), 1);
//     assert.equal(people.objectAt(3).get('id'), 2);
// });

// test('sort property may be an array (introduced when removing optimized rendering in grid)', function(assert) {
//     store.push('person', {id: 3, username: 'abc', first_name: PEOPLE_DEFAULTS.first_name, last_name: ''});
//     store.push('person', {id: 1, username: 'def', title: PEOPLE_DEFAULTS.title});
//     store.push('person', {id: 2, first_name: PEOPLE_DEFAULTS.first_name, username: 'zzz', title: PEOPLE_DEFAULTS.title});
//     var subject = this.subject({model: store.find('person'), eventbus: eventbus, defaultSort: ['id'], columns: columns});
//     var people = subject.get('sorted_content');
//     assert.equal(people.objectAt(0).get('id'), 1);
//     assert.equal(people.objectAt(1).get('id'), 2);
//     assert.equal(people.objectAt(2).get('id'), 3);
//     subject.set('sort', ['username']);
//     people = subject.get('sorted_content');
//     assert.equal(people.objectAt(0).get('id'), 3);
//     assert.equal(people.objectAt(1).get('id'), 1);
//     assert.equal(people.objectAt(2).get('id'), 2);
//     store.push('person', {id: 4, username: 'babel', first_name: PEOPLE_DEFAULTS.first_name});
//     people = subject.get('sorted_content');
//     assert.equal(people.objectAt(0).get('id'), 3);
//     assert.equal(people.objectAt(1).get('id'), 4);
//     assert.equal(people.objectAt(2).get('id'), 1);
//     assert.equal(people.objectAt(3).get('id'), 2);
// });

// test('given a list of people and page number, should only return those people on that page', function(assert) {
//     store.push('person', {id: 3, username: 'abc', first_name: '', last_name: ''});
//     store.push('person', {id: 1, username: 'def', first_name: '', last_name: ''});
//     store.push('person', {id: 2, username: 'zzz', first_name: '', last_name: ''});
//     store.push('person', {id: 4, username: 'abc', first_name: '', last_name: ''});
//     store.push('person', {id: 5, username: 'abc', first_name: '', last_name: ''});
//     store.push('person', {id: 6, username: 'def', first_name: '', last_name: ''});
//     store.push('person', {id: 7, username: 'zzz', first_name: '', last_name: ''});
//     store.push('person', {id: 8, username: 'def', first_name: '', last_name: ''});
//     store.push('person', {id: 9, username: 'zzz', first_name: '', last_name: ''});
//     store.push('person', {id: 10, username: 'zzz', first_name: '', last_name: ''});
//     store.push('person', {id: 11, username: 'zzz', first_name: '', last_name: ''});
//     var model = store.find('person');
//     model.set('count', 3);
//     requested.pushObject(1);
//     var subject = this.subject({requested: requested, model: model, page_size: 2, eventbus: eventbus, defaultSort: ['id'], columns: columns});
//     var people = subject.get('paginated_content');
//     assert.equal(subject.get('page'), undefined);
//     assert.equal(people.get('length'), 10);
//     requested.pushObject(2);
//     subject.set('page', 2);
//     people = subject.get('paginated_content');
//     assert.equal(people.get('length'), 1);
//     store.push('person', {id: 4, username: 'yehuda'});
//     people = subject.get('paginated_content');
//     assert.equal(people.get('length'), 2);
// });


// test('searched content allows you to look through searchable keys and filter accordingly', function(assert) {
//     store.push('person', {id: 1, first_name: 'ab', last_name: '', username: 'x', title: 'scott newcomer'});
//     store.push('person', {id: 2, first_name: 'cd', last_name: '', username: 'y', title: 'toran lillups'});
//     store.push('person', {id: 3, first_name: 'de', last_name: '', username: 'z', title: 'aaron lelevier'});
//     var subject = this.subject({model: store.find('person'), eventbus: eventbus, columns: columns});
//     var people = subject.get('searched_content');
//     assert.equal(people.get('length'), 3);
//     subject.set('search', 'scot');
//     people = subject.get('searched_content');
//     assert.equal(people.get('length'), 1);
//     assert.equal(people.objectAt(0).get('title'), 'scott newcomer');
//     subject.set('search', '');
//     people = subject.get('searched_content');
//     assert.equal(people.get('length'), 3);
//     subject.set('search', 'q');
//     people = subject.get('searched_content');
//     assert.equal(people.get('length'), 0);
//     subject.set('search', 'd');
//     people = subject.get('searched_content');
//     assert.equal(people.get('length'), 2);
//     assert.equal(people.objectAt(0).get('id'), 2);
//     assert.equal(people.objectAt(1).get('id'), 3);
//     subject.set('search', 'c');
//     people = subject.get('searched_content');
//     assert.equal(people.get('length'), 2);
//     assert.equal(people.objectAt(0).get('id'), 2);
//     assert.equal(people.objectAt(1).get('id'), 1);
//     store.push('person', {id: 4, first_name: 'mmm', username: 'n', title: 'cup lelevier'});
//     people = subject.get('searched_content');
//     assert.equal(people.get('length'), 3);
//     assert.equal(people.objectAt(0).get('id'), 2);
//     assert.equal(people.objectAt(1).get('id'), 1);
//     assert.equal(people.objectAt(2).get('id'), 4);
//     subject.set('search', 'n l');
//     people = subject.get('searched_content');
//     assert.equal(people.get('length'), 2);
//     assert.equal(people.objectAt(0).get('id'), 2);
//     assert.equal(people.objectAt(1).get('id'), 3);
//     subject.set('search', 'n ');
//     people = subject.get('searched_content');
//     assert.equal(people.get('length'), 4);
//     assert.equal(people.objectAt(0).get('id'), 4);
//     assert.equal(people.objectAt(1).get('id'), 1);
//     assert.equal(people.objectAt(2).get('id'), 2);
//     assert.equal(people.objectAt(3).get('id'), 3);
//     subject.set('search', 'N');
//     people = subject.get('searched_content');
//     assert.equal(people.get('length'), 4);
//     assert.equal(people.objectAt(0).get('id'), 4);
//     assert.equal(people.objectAt(1).get('id'), 1);
//     assert.equal(people.objectAt(2).get('id'), 2);
//     assert.equal(people.objectAt(3).get('id'), 3);
// });

test('found content allows you to look through searchable keys and filter accordingly', function(assert) {
    run(() => {
        store.push('person', {id: 1, first_name: 'ab', last_name: '', username: 'azd', title: 'scott newcomer'});
        store.push('person', {id: 2, first_name: 'cd', last_name: '', username: 'yzq', title: 'toran billups'});
        store.push('person', {id: 3, first_name: 'de', last_name: '', username: 'zed', title: 'aaron lelevier'});
    });
    var subject = this.subject({model: store.find('person'), eventbus: eventbus, columns: columns});
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

test('found will filter out null objects when that column is searched on explicitly', function(assert) {
    run(() => {
        store.push('person', {id: 1, first_name: '', last_name: '', username: 'aaron', title: 'abz'});
        store.push('person', {id: 2, first_name: '', last_name: '', username: 'aute', title: 'abc'});
        store.push('person', {id: 3, first_name: '', last_name: '', username: 'veniam', title: null});
        store.push('person', {id: 4, first_name: '', last_name: '', username: 'cupidatat', title: null});
        store.push('person', {id: 5, first_name: '', last_name: '', username: 'laborum.', title: null});
        store.push('person', {id: 6, first_name: '', last_name: '', username: 'pariatur', title: null});
        store.push('person', {id: 7, first_name: '', last_name: '', username: 'voluptate', title: null});
        store.push('person', {id: 8, first_name: '', last_name: '', username: 'adipisicing', title: null});
    });
    var subject = this.subject({model: store.find('person'), eventbus: eventbus, columns: columns});
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

test('found filter will only match those exactly in all columns', function(assert) {
    run(() => {
        store.push('person', {id: 1, foo: 'baa', username: 'xyzz', title: 'deaa'});
        store.push('person', {id: 2, foo: 'bab', username: 'xyyy', title: 'deaa'});
        store.push('person', {id: 3, foo: 'babc', username: 'xyyx', title: 'deaa'});
        store.push('person', {id: 4, foo: 'babcd', username: 'xyyw', title: 'deaa'});
        store.push('person', {id: 5, foo: 'babcde', username: 'xyyv1', title: 'deaab'});
        store.push('person', {id: 6, foo: 'babcde', username: 'xyyv2', title: 'deaabc'});
        store.push('person', {id: 7, foo: 'babcde', username: 'xyyv3', title: 'deaabcd'});
        store.push('person', {id: 8, foo: 'babcdeq', username: 'xyyv4', title: 'deaabcde'});
    });
    var subject = this.subject({model: store.find('person'), eventbus: eventbus, columns: columns});
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

test('found content is case insensitive when building regex', function(assert) {
    run(() => {
        store.push('person', {id: 1, first_name: 'ab', last_name: '', username: 'azd', title: 'scott newcomer'});
        store.push('person', {id: 2, first_name: 'cd', last_name: '', username: 'yzq', title: 'toran billups'});
        store.push('person', {id: 3, first_name: 'de', last_name: '', username: 'zed', title: 'aaron lelevier'});
    });
    var subject = this.subject({model: store.find('person'), eventbus: eventbus, columns: columns});
    var people = subject.get('found_content');
    assert.equal(people.get('length'), 3);
    subject.set('find', 'title:Sco');
    people = subject.get('found_content');
    assert.equal(people.get('length'), 1);
    assert.equal(people.objectAt(0).get('title'), 'scott newcomer');
    subject.set('find', 'title:sco,username:Z');
    people = subject.get('found_content');
    assert.equal(people.get('length'), 1);
    assert.equal(people.objectAt(0).get('title'), 'scott newcomer');
    subject.set('find', 'title:sco,username:ZE');
    people = subject.get('found_content');
    assert.equal(people.get('length'), 0);
    subject.set('find', 'title:,username:Z');
    people = subject.get('found_content');
    assert.equal(people.get('length'), 3);
});


test('given a dynamic list of people and page number, should return the correct records starting deeper and working backwards', function(assert) {
    run(() => {
        store.push('person', {id: 11, username: 'zzz1'});
        store.push('person', {id: 12, username: 'zzz2'});
        store.push('person', {id: 13, username: 'zzz3'});
        store.push('person', {id: 14, username: 'zzz4'});
        store.push('person', {id: 15, username: 'zzz5'});
        store.push('person', {id: 16, username: 'zzz6'});
        store.push('person', {id: 17, username: 'zzz7'});
        store.push('person', {id: 18, username: 'zzz8'});
        store.push('person', {id: 19, username: 'zzz9'});
        store.push('person', {id: 20, username: 'zzz99'});
    });
    var model = store.find('person');
    model.set('count', 187);
    requested.pushObject(3);
    var subject = this.subject({requested: requested, model: model, page_size: 10, page: 3, eventbus: eventbus, defaultSort: ['id'], columns: columns});
    var content = subject.get('paginated_content');
    assert.equal(content.get('length'), 10);
    assert.equal(content.objectAt(0).get('id'), 11);
    assert.equal(content.objectAt(9).get('id'), 20);
    requested.pushObject(2);
    subject.set('page', 2);
    model.set('count', 187);
    run(() => {
        store.push('person', {id: 3, username: 'abc3'});
        store.push('person', {id: 1, username: 'abc1'});
        store.push('person', {id: 2, username: 'abc2'});
        store.push('person', {id: 4, username: 'abc4'});
        store.push('person', {id: 5, username: 'abc5'});
        store.push('person', {id: 6, username: 'abc6'});
        store.push('person', {id: 7, username: 'abc7'});
        store.push('person', {id: 8, username: 'abc8'});
        store.push('person', {id: 9, username: 'abc9'});
        store.push('person', {id: 10, username: 'abc99'});
    });
    content = subject.get('paginated_content');
    assert.equal(content.get('length'), 10);
    assert.equal(content.objectAt(0).get('id'), 11);
    assert.equal(content.objectAt(9).get('id'), 20);
});

//SCOTT: not sure these are applicable anymore.  Grid only displays what it is given
// test('given another dynamic list of people and page number, should return the correct records starting deeper and working backwards', function(assert) {
//     store.push('person', {id: 21, username: 'zzz1'});
//     store.push('person', {id: 22, username: 'zzz2'});
//     store.push('person', {id: 23, username: 'zzz3'});
//     store.push('person', {id: 24, username: 'zzz4'});
//     store.push('person', {id: 25, username: 'zzz5'});
//     store.push('person', {id: 26, username: 'zzz6'});
//     store.push('person', {id: 27, username: 'zzz7'});
//     store.push('person', {id: 28, username: 'zzz8'});
//     store.push('person', {id: 29, username: 'zzz9'});
//     store.push('person', {id: 30, username: 'zzz99'});
//     var model = store.find('person');
//     model.set('count', 187);
//     requested.pushObject(5);
//     var subject = this.subject({requested: requested, model: model, page_size: 10, page: 5, eventbus: eventbus, defaultSort: ['id'], columns: columns});
//     var content = subject.get('paginated_content');
//     assert.equal(content.get('length'), 10);
//     assert.equal(content.objectAt(0).get('id'), 21);
//     assert.equal(content.objectAt(9).get('id'), 30);
//     requested.pushObject(1);
//     subject.set('page', 1);
//     model.set('count', 187);
//     store.push('person', {id: 3, username: 'abc3'});
//     store.push('person', {id: 1, username: 'abc1'});
//     store.push('person', {id: 2, username: 'abc2'});
//     store.push('person', {id: 4, username: 'abc4'});
//     store.push('person', {id: 5, username: 'abc5'});
//     store.push('person', {id: 6, username: 'abc6'});
//     store.push('person', {id: 7, username: 'abc7'});
//     store.push('person', {id: 8, username: 'abc8'});
//     store.push('person', {id: 9, username: 'abc9'});
//     store.push('person', {id: 10, username: 'abc99'});
//     content = subject.get('paginated_content');
//     assert.equal(content.get('length'), 10);
//     assert.equal(content.objectAt(0).get('id'), 21);
//     assert.equal(content.objectAt(9).get('id'), 30);
//     requested.pushObject(3);
//     subject.set('page', 3);
//     model.set('count', 187);
//     store.push('person', {id: 11, username: 'zzz1'});
//     store.push('person', {id: 12, username: 'zzz2'});
//     store.push('person', {id: 13, username: 'zzz3'});
//     store.push('person', {id: 14, username: 'zzz4'});
//     store.push('person', {id: 15, username: 'zzz5'});
//     store.push('person', {id: 16, username: 'zzz6'});
//     store.push('person', {id: 17, username: 'zzz7'});
//     store.push('person', {id: 18, username: 'zzz8'});
//     store.push('person', {id: 19, username: 'zzz9'});
//     store.push('person', {id: 20, username: 'zzz99'});
//     content = subject.get('paginated_content');
//     assert.equal(content.get('length'), 10);
//     assert.equal(content.objectAt(0).get('id'), 3);
//     assert.equal(content.objectAt(9).get('id'), 10);
// });

// test('requesting pages in order still returns the correct results even when the same page is viewed twice', function(assert) {
//     store.push('person', {id: 3, username: 'abc3'});
//     store.push('person', {id: 1, username: 'abc1'});
//     store.push('person', {id: 2, username: 'abc2'});
//     store.push('person', {id: 4, username: 'abc4'});
//     store.push('person', {id: 5, username: 'abc5'});
//     store.push('person', {id: 6, username: 'abc6'});
//     store.push('person', {id: 7, username: 'abc7'});
//     store.push('person', {id: 8, username: 'abc8'});
//     store.push('person', {id: 9, username: 'abc9'});
//     store.push('person', {id: 10, username: 'abc99'});
//     var model = store.find('person');
//     model.set('count', 187);
//     requested.pushObject(1);
//     var subject = this.subject({requested: requested, model: model, page_size: 10, page: 1, eventbus: eventbus, defaultSort: ['id'], columns: columns});
//     var content = subject.get('paginated_content');
//     assert.equal(content.get('length'), 10);
//     //content is not sorted anymore so first one is 3
//     assert.equal(content.objectAt(0).get('id'), 3);
//     assert.equal(content.objectAt(9).get('id'), 10);
//     requested.pushObject(2);
//     subject.set('page', 2);
//     model.set('count', 187);
//     store.push('person', {id: 11, username: 'zzz1'});
//     store.push('person', {id: 12, username: 'zzz2'});
//     store.push('person', {id: 13, username: 'zzz3'});
//     store.push('person', {id: 14, username: 'zzz4'});
//     store.push('person', {id: 15, username: 'zzz5'});
//     store.push('person', {id: 16, username: 'zzz6'});
//     store.push('person', {id: 17, username: 'zzz7'});
//     store.push('person', {id: 18, username: 'zzz8'});
//     store.push('person', {id: 19, username: 'zzz9'});
//     store.push('person', {id: 20, username: 'zzz99'});
//     content = subject.get('paginated_content');
//     assert.equal(content.get('length'), 10);
//     assert.equal(content.objectAt(0).get('id'), 11);
//     assert.equal(content.objectAt(9).get('id'), 20);
//     requested.pushObject(3);
//     subject.set('page', 3);
//     model.set('count', 187);
//     store.push('person', {id: 21, username: 'zzz1'});
//     store.push('person', {id: 22, username: 'zzz2'});
//     store.push('person', {id: 23, username: 'zzz3'});
//     store.push('person', {id: 24, username: 'zzz4'});
//     store.push('person', {id: 25, username: 'zzz5'});
//     store.push('person', {id: 26, username: 'zzz6'});
//     store.push('person', {id: 27, username: 'zzz7'});
//     store.push('person', {id: 28, username: 'zzz8'});
//     store.push('person', {id: 29, username: 'zzz9'});
//     store.push('person', {id: 30, username: 'zzz99'});
//     content = subject.get('paginated_content');
//     assert.equal(content.get('length'), 10);
//     assert.equal(content.objectAt(0).get('id'), 21);
//     assert.equal(content.objectAt(9).get('id'), 30);
//     requested.pushObject(4);
//     subject.set('page', 4);
//     model.set('count', 187);
//     store.push('person', {id: 31, username: 'qqq1'});
//     store.push('person', {id: 32, username: 'qqq2'});
//     store.push('person', {id: 33, username: 'qqq3'});
//     store.push('person', {id: 34, username: 'qqq4'});
//     store.push('person', {id: 35, username: 'qqq5'});
//     store.push('person', {id: 36, username: 'qqq6'});
//     store.push('person', {id: 37, username: 'qqq7'});
//     store.push('person', {id: 38, username: 'qqq8'});
//     store.push('person', {id: 39, username: 'qqq9'});
//     store.push('person', {id: 40, username: 'qqq99'});
//     content = subject.get('paginated_content');
//     assert.equal(content.get('length'), 10);
//     assert.equal(content.objectAt(0).get('id'), 31);
//     assert.equal(content.objectAt(9).get('id'), 40);
//     requested.pushObject(3);
//     subject.set('page', 3);
//     model.set('count', 187);
//     store.push('person', {id: 21, username: 'zzz1'});
//     store.push('person', {id: 22, username: 'zzz2'});
//     store.push('person', {id: 23, username: 'zzz3'});
//     store.push('person', {id: 24, username: 'zzz4'});
//     store.push('person', {id: 25, username: 'zzz5'});
//     store.push('person', {id: 26, username: 'zzz6'});
//     store.push('person', {id: 27, username: 'zzz7'});
//     store.push('person', {id: 28, username: 'zzz8'});
//     store.push('person', {id: 29, username: 'zzz9'});
//     store.push('person', {id: 30, username: 'zzz99'});
//     content = subject.get('paginated_content');
//     assert.equal(content.get('length'), 10);
//     assert.equal(content.objectAt(0).get('id'), 21);
//     assert.equal(content.objectAt(9).get('id'), 30);
//     requested.pushObject(5);
//     subject.set('page', 5);
//     model.set('count', 187);
//     store.push('person', {id: 41, username: 'wat1'});
//     store.push('person', {id: 42, username: 'wat2'});
//     store.push('person', {id: 43, username: 'wat3'});
//     store.push('person', {id: 44, username: 'wat4'});
//     store.push('person', {id: 45, username: 'wat5'});
//     store.push('person', {id: 46, username: 'wat6'});
//     store.push('person', {id: 47, username: 'wat7'});
//     store.push('person', {id: 48, username: 'wat8'});
//     store.push('person', {id: 49, username: 'wat9'});
//     store.push('person', {id: 50, username: 'wat99'});
//     content = subject.get('paginated_content');
//     assert.equal(content.get('length'), 10);
//     assert.equal(content.objectAt(0).get('id'), 41);
//     assert.equal(content.objectAt(9).get('id'), 50);
//     requested.pushObject(4);
//     subject.set('page', 4);
//     model.set('count', 187);
//     store.push('person', {id: 31, username: 'qqq1'});
//     store.push('person', {id: 32, username: 'qqq2'});
//     store.push('person', {id: 33, username: 'qqq3'});
//     store.push('person', {id: 34, username: 'qqq4'});
//     store.push('person', {id: 35, username: 'qqq5'});
//     store.push('person', {id: 36, username: 'qqq6'});
//     store.push('person', {id: 37, username: 'qqq7'});
//     store.push('person', {id: 38, username: 'qqq8'});
//     store.push('person', {id: 39, username: 'qqq9'});
//     store.push('person', {id: 40, username: 'qqq99'});
//     content = subject.get('paginated_content');
//     assert.equal(content.get('length'), 10);
//     assert.equal(content.objectAt(0).get('id'), 31);
//     assert.equal(content.objectAt(9).get('id'), 40);
//     requested.pushObject(12);
//     subject.set('page', 12);
//     model.set('count', 187);
//     store.push('person', {id: 81, username: 'hat1'});
//     store.push('person', {id: 82, username: 'hat2'});
//     store.push('person', {id: 83, username: 'hat3'});
//     store.push('person', {id: 84, username: 'hat4'});
//     store.push('person', {id: 85, username: 'hat5'});
//     store.push('person', {id: 86, username: 'hat6'});
//     store.push('person', {id: 87, username: 'hat7'});
//     store.push('person', {id: 88, username: 'hat8'});
//     store.push('person', {id: 89, username: 'hat9'});
//     store.push('person', {id: 90, username: 'hat99'});
//     content = subject.get('paginated_content');
//     assert.equal(content.get('length'), 10);
//     assert.equal(content.objectAt(0).get('id'), 81);
//     assert.equal(content.objectAt(9).get('id'), 90);
// });

// test('searched content allows you to look through related models', function(assert) {
//     store.push('role', {id: 1, name: 'role1', people: [1,2]});
//     store.push('role', {id: 2, name: 'role2', people: [3]});
//     store.push('person', {id: 1, first_name: 'ab', last_name: '', username: 'x', title: 'scott newcomer', role_fk: 1});
//     store.push('person', {id: 2, first_name: 'cd', last_name: '', username: 'y', title: 'toran lillups', role_fk: 1});
//     store.push('person', {id: 3, first_name: 'de', last_name: '', username: 'z', title: 'aaron lelevier', role_fk: 2});
//     var subject = this.subject({model: store.find('person'), eventbus: eventbus, columns: columns_with_role});
//     var people = subject.get('searched_content');
//     assert.equal(people.get('length'), 3);
//     subject.set('search', '1');
//     people = subject.get('searched_content');
//     assert.equal(people.get('length'), 2);
//     assert.equal(people.objectAt(0).get('title'), 'scott newcomer');
//     assert.equal(people.objectAt(1).get('title'), 'toran lillups');
//     subject.set('search', '');
//     people = subject.get('searched_content');
//     assert.equal(people.get('length'), 3);
// });

test('found content allows you to look through related models', function(assert) {
    run(() => {
        store.push('role', {id: 1, name: 'role1', people: [1,2]});
        store.push('role', {id: 2, name: 'role2', people: [3]});
        store.push('person', {id: 1, first_name: 'ab', last_name: '', username: 'x', title: 'scott newcomer', role_fk: 1});
        store.push('person', {id: 2, first_name: 'cd', last_name: '', username: 'y', title: 'toran lillups', role_fk: 1});
        store.push('person', {id: 3, first_name: 'de', last_name: '', username: 'z', title: 'aaron lelevier', role_fk: 2});
    });
    var subject = this.subject({model: store.find('person'), eventbus: eventbus, columns: columns_with_role});
    var people = subject.get('found_content');
    assert.equal(people.get('length'), 3);
    subject.set('find', 'role.name:2');
    people = subject.get('found_content');
    assert.equal(people.get('length'), 1);
    assert.equal(people.objectAt(0).get('title'), 'aaron lelevier');
});

// test('sorted content is sorted related models', function(assert) {
//     store.push('role', {id: 1, name: 'zzz', people: [1,2]});
//     store.push('role', {id: 2, name: 'aaa', people: [3]});
//     store.push('person', {id: 3, username: 'abc', first_name: PEOPLE_DEFAULTS.first_name, last_name: '', role_fks: 1});
//     store.push('person', {id: 1, username: 'def', title: PEOPLE_DEFAULTS.title, role_fk: 1});
//     store.push('person', {id: 2, first_name: PEOPLE_DEFAULTS.first_name, username: 'zzz', title: PEOPLE_DEFAULTS.title, role_fk: 2});
//     var subject = this.subject({model: store.find('person'), eventbus: eventbus, defaultSort: ['id'], columns: columns_with_role});
//     var people = subject.get('sorted_content');
//     assert.equal(people.objectAt(0).get('id'), 1);
//     assert.equal(people.objectAt(1).get('id'), 2);
//     assert.equal(people.objectAt(2).get('id'), 3);
//     subject.set('sort', 'role.name');
//     people = subject.get('sorted_content');
//     assert.equal(people.objectAt(0).get('id'), 3);
//     assert.equal(people.objectAt(1).get('id'), 1);
//     assert.equal(people.objectAt(2).get('id'), 2);
// });
