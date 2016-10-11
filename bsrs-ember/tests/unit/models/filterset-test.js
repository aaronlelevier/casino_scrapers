import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';

var store, subject, params;

module('unit: filterset test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:filterset']);
    }
});

test('params will update when the model endpoint_uri is updated (and page=1 is always present)', (assert) => {
    subject = store.push('filterset', {id: 1, endpoint_uri: '?search=wa'});
    params = subject.get('params');
    assert.deepEqual(params.get('values'), {page: 1, search: 'wa', find: undefined, sort: undefined});
    subject.set('endpoint_uri', '?sort=title&search=ze');
    params = subject.get('params');
    assert.deepEqual(params.get('values'), {page: 1, sort: 'title', search: 'ze', find: undefined});
});

test('params will transform search query string into valid ember route query-param object', (assert) => {
    subject = store.push('filterset', {id: 1, endpoint_uri: '?search=wa'});
    params = subject.get('params');
    assert.deepEqual(params.get('values'), {page: 1, search: 'wa', find: undefined, sort: undefined});
    assert.deepEqual(params.get('isQueryParams'), true);
});

test('params will transform single sort query string into valid ember route query-param object', (assert) => {
    subject = store.push('filterset', {id: 1, endpoint_uri: '?sort=title'});
    params = subject.get('params');
    assert.deepEqual(params.get('values'), {page: 1, sort: 'title', find: undefined, search: undefined});
});

test('params will transform multi-sort query string into valid ember route query-param object', (assert) => {
    subject = store.push('filterset', {id: 1, endpoint_uri: '?sort=username%2C-title'});
    params = subject.get('params');
    assert.deepEqual(params.get('values'), {page: 1, sort: 'username,-title', search: undefined, find: undefined});
});

test('params will transform single fulltext query string into valid ember route query-param object', (assert) => {
    subject = store.push('filterset', {id: 1, endpoint_uri: '?find=fullname%3Atru'});
    params = subject.get('params');
    assert.deepEqual(params.get('values'), {page: 1, find: 'fullname:tru', sort: undefined, search: undefined});
});

test('params will transform multi-fulltext query string into valid ember route query-param object', (assert) => {
    subject = store.push('filterset', {id: 1, endpoint_uri: '?find=fullname%3Atr%2Ctitle%3Aex'});
    params = subject.get('params');
    assert.deepEqual(params.get('values'), {page: 1, find: 'fullname:tr,title:ex', sort: undefined, search: undefined});
});

test('filter_exists will return true when a match occurs for sort/find/search and path (regardless of order)', (assert) => {
    let path = 'admin.roles.index';
    subject = store.push('filterset', {id: 1, endpoint_name: path, endpoint_uri: '?search=wa'});
    assert.deepEqual(subject.get('params').get('values'), {page: 1, search: 'wa', find: undefined, sort: undefined});
    assert.ok(!subject.filter_exists(path, {search: 'wa', find: 'fullname:tru', sort: 'title'}));
    subject.set('endpoint_uri', '?find=fullname%3Atru&search=wa');
    assert.deepEqual(subject.get('params').get('values'), {page: 1, find: 'fullname:tru', search: 'wa', sort: undefined});
    assert.ok(!subject.filter_exists(path, {search: 'wa', find: 'fullname:tru', sort: 'title'}));
    subject.set('endpoint_uri', '?find=fullname%3Atru&search=wa&sort=title');
    assert.deepEqual(subject.get('params').get('values'), {page: 1, find: 'fullname:tru', search: 'wa', sort: 'title'});
    assert.ok(subject.filter_exists(path, {search: 'wa', find: 'fullname:tru', sort: 'title'}));
    assert.ok(subject.filter_exists(path, {find: 'fullname:tru', search: 'wa', sort: 'title'}));
    assert.ok(!subject.filter_exists('admin.people.index', {find: 'fullname:tru', search: 'wa', sort: 'title'}));
    subject.set('endpoint_uri', '?find=fullname%3Atru&search=wa&sort=titlez');
    assert.deepEqual(subject.get('params').get('values'), {page: 1, find: 'fullname:tru', search: 'wa', sort: 'titlez'});
    assert.ok(!subject.filter_exists(path, {search: 'wa', find: 'fullname:tru', sort: 'title'}));
    subject.set('endpoint_uri', '?find=fullname%3Atru&search=wa');
    assert.deepEqual(subject.get('params').get('values'), {page: 1, find: 'fullname:tru', search: 'wa', sort: undefined});
    assert.ok(!subject.filter_exists(path, {search: 'wa', find: 'fullname:tru', sort: 'title'}));
    subject.set('endpoint_uri', '?find=fullname%3Atru&search=wa&sort=title');
    assert.deepEqual(subject.get('params').get('values'), {page: 1, find: 'fullname:tru', search: 'wa', sort: 'title'});
    assert.ok(subject.filter_exists(path, {search: 'wa', find: 'fullname:tru', sort: 'title'}));
    assert.ok(!subject.filter_exists(path, {search: 'wa', find: undefined, sort: 'title'}));
});

test('filter_exists will return true when a match occurs for sort/find/search but page is present', (assert) => {
    let path = 'admin.roles.index';
    subject = store.push('filterset', {id: 1, endpoint_name: path, endpoint_uri: '?find=fullname%3Atru&search=wa&sort=title'});
    assert.deepEqual(subject.get('params').get('values'), {page: 1, find: 'fullname:tru', search: 'wa', sort: 'title'});
    assert.ok(subject.filter_exists(path, {search: 'wa', find: 'fullname:tru', sort: 'title'}));
});

test('filter_exists will return true when a match occurs for sort/find/search but params is missing a particular key', (assert) => {
    let path = 'admin.roles.index';
    subject = store.push('filterset', {id: 1, endpoint_name: path, endpoint_uri: '?find=fullname%3Atru&search=wa'});
    assert.deepEqual(subject.get('params').get('values'), {page: 1, find: 'fullname:tru', search: 'wa', sort: undefined});
    assert.ok(subject.filter_exists(path, {search: 'wa', find: 'fullname:tru', sort: undefined}));
});

test('params will remove any unused sort/find/search as the computed property changes', (assert) => {
    subject = store.push('filterset', {id: 1, endpoint_uri: '?search=wa'});
    assert.deepEqual(subject.get('params').get('values'), {page: 1, search: 'wa', find: undefined, sort: undefined});
    subject.set('endpoint_uri', '?find=fullname%3Atru&search=wa');
    assert.deepEqual(subject.get('params').get('values'), {page: 1, find: 'fullname:tru', search: 'wa', sort: undefined});
    subject.set('endpoint_uri', '?find=fullname%3Atru&search=wa&sort=title');
    assert.deepEqual(subject.get('params').get('values'), {page: 1, find: 'fullname:tru', search: 'wa', sort: 'title'});
    subject.set('endpoint_uri', '?find=fullname%3Atru&search=wa&sort=titlez');
    assert.deepEqual(subject.get('params').get('values'), {page: 1, find: 'fullname:tru', search: 'wa', sort: 'titlez'});
    subject.set('endpoint_uri', '?find=fullname%3Atru&search=wa');
    assert.deepEqual(subject.get('params').get('values'), {page: 1, find: 'fullname:tru', search: 'wa', sort: undefined});
    subject.set('endpoint_uri', '?search=de');
    assert.deepEqual(subject.get('params').get('values'), {page: 1, search: 'de', find: undefined, sort: undefined});
    subject.set('endpoint_uri', '?find=fullname%3Atru&search=wa&sort=title');
    assert.deepEqual(subject.get('params').get('values'), {page: 1, find: 'fullname:tru', search: 'wa', sort: 'title'});
});
