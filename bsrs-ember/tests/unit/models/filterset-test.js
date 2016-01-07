import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';

var store, subject, params;

module('unit: filterset test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:filterset']);
    }
});

test('params will update when the model endpoint_uri is updated', (assert) => {
    subject = store.push('filterset', {id: 1, endpoint_uri: '?search=wa'});
    params = subject.get('params');
    assert.deepEqual(params.get('values'), {search: 'wa'});
    subject.set('endpoint_uri', '?page=2&search=ze');
    params = subject.get('params');
    assert.deepEqual(params.get('values'), {page: '2', search: 'ze'});
});

test('params will transform search query string into valid ember route query-param object', (assert) => {
    subject = store.push('filterset', {id: 1, endpoint_uri: '?search=wa'});
    params = subject.get('params');
    assert.deepEqual(params.get('values'), {search: 'wa'});
    assert.deepEqual(params.get('isQueryParams'), true);
});

test('params will transform page size query string into valid ember route query-param object', (assert) => {
    subject = store.push('filterset', {id: 1, endpoint_uri: '?page_size=25'});
    params = subject.get('params');
    assert.deepEqual(params.get('values'), {page_size: '25'});
});

test('params will transform pagination query string into valid ember route query-param object', (assert) => {
    subject = store.push('filterset', {id: 1, endpoint_uri: '?page=3'});
    params = subject.get('params');
    assert.deepEqual(params.get('values'), {page: '3'});
});

test('params will transform single sort query string into valid ember route query-param object', (assert) => {
    subject = store.push('filterset', {id: 1, endpoint_uri: '?sort=title'});
    params = subject.get('params');
    assert.deepEqual(params.get('values'), {sort: 'title'});
});

test('params will transform multi-sort query string into valid ember route query-param object', (assert) => {
    subject = store.push('filterset', {id: 1, endpoint_uri: '?sort=username%2C-title'});
    params = subject.get('params');
    assert.deepEqual(params.get('values'), {sort: 'username,-title'});
});

test('params will transform single fulltext query string into valid ember route query-param object', (assert) => {
    subject = store.push('filterset', {id: 1, endpoint_uri: '?find=fullname%3Atru'});
    params = subject.get('params');
    assert.deepEqual(params.get('values'), {find: 'fullname:tru'});
});

test('params will transform multi-fulltext query string into valid ember route query-param object', (assert) => {
    subject = store.push('filterset', {id: 1, endpoint_uri: '?find=fullname%3Atr%2Ctitle%3Aex'});
    params = subject.get('params');
    assert.deepEqual(params.get('values'), {find: 'fullname:tr,title:ex'});
});
